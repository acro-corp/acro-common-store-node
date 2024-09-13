/**
 * Copyright (C) 2024 Acro Data Solutions, Inc.

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  Action,
  ActionSchema,
  FindActionFilters,
  FindActionOptions,
} from "./action";
import { Logger, LogLevel } from "./logger";

/**
 * Extend this class for any database.
 */
abstract class Engine<DbAction> {
  _logger: Function | null =
    typeof console !== "undefined" ? console.log : null;
  // logger helper function
  _logLevel: LogLevel = LogLevel.warn;

  logger: Logger;

  constructor(options: { logger?: Function; logLevel?: LogLevel }) {
    if (options?.logLevel) {
      this._logLevel = options?.logLevel;
    }

    if (options?.logger) {
      this._logger = options?.logger;
    }

    this.logger = {
      off: this.log.bind(this, LogLevel.off),
      fatal: this.log.bind(this, LogLevel.fatal),
      error: this.log.bind(this, LogLevel.error),
      warn: this.log.bind(this, LogLevel.warn),
      info: this.log.bind(this, LogLevel.info),
      debug: this.log.bind(this, LogLevel.debug),
      trace: this.log.bind(this, LogLevel.trace),
      all: this.log.bind(this, LogLevel.all),
    };
  }

  /**
   * Logger function
   * @param {LogLevel} level
   * @param {string} message
   */
  log(level: LogLevel, message?: string, ...args: any) {
    if (
      level <= this._logLevel &&
      this._logger &&
      typeof this._logger === "function"
    ) {
      this._logger.apply(this, [
        `[${LogLevel[level]}] [@acro-sdk/store] ${message || ""}`,
        ...args,
      ]);
    }
  }

  /**
   * Converts an Action into the Action interface used by the DB engine
   * @param {Action} action
   * @returns {DbAction} dbAction
   */
  abstract serialize(action: Action): DbAction | Promise<DbAction>;

  /**
   * Converts a DB engine action into the standard Action interface
   * @param {DbAction} dbAction
   * @returns {Action} action
   */
  abstract deserialize(dbAction: DbAction): Action | Promise<Action>;

  /**
   * Creates an DB engine action in the database
   * @param {DbAction} dbAction
   * @returns {DbAction} createdAction
   */
  abstract create(dbAction: DbAction): Promise<DbAction>;

  /**
   * Creates several DB engine actions in the database
   * @param {DbAction[]} dbActions
   * @returns {DbAction[]} createdActions
   */
  abstract createMany(dbActions: DbAction[]): Promise<DbAction[]>;

  /**
   * Finds and returns a single DB engine action
   * @param {string} id
   * @returns {DbAction} dbAction
   */
  abstract findById(id: string): Promise<DbAction>;

  /**
   * Finds and returns multiple DB engine actions
   * @param {string} id
   * @returns {DbAction} dbAction
   */
  abstract findMany(
    options?: FindActionOptions,
    filters?: FindActionFilters
  ): Promise<DbAction[]>;

  // ------------------------------------------------------------------------------------
  // Below are methods that work only with Actions, not DB engine actions
  // Clients should only be calling these methods not the DB-specific ones above

  /**
   * Creates an action in the database after converting to DB engine action
   * @param {Action} action
   * @returns {DbAction} createdAction
   */
  async createAction(action: Action): Promise<Action> {
    // validate
    ActionSchema.parse(action);

    return this.deserialize(await this.create(await this.serialize(action)));
  }

  /**
   * Creates multiple actions in the database after converting to DB engine actions
   * @param {Action[]} action
   * @returns {DbAction[]} createdActions
   */
  async createManyActions(actions: Action[]): Promise<Action[]> {
    // validate
    actions.forEach((action) => ActionSchema.parse(action));

    return Promise.all(
      (
        await this.createMany(
          await Promise.all(actions.map((action) => this.serialize(action)))
        )
      ).map((dbAction) => this.deserialize(dbAction))
    );
  }

  /**
   * Finds and returns a single action
   * @param {string} id
   * @returns {Action} action
   */
  async findActionById(id: string): Promise<Action> {
    const dbAction = await this.findById(id);

    return this.deserialize(dbAction);
  }

  /**
   * Finds and returns multiple DB engine actions
   * @param {string} id
   * @returns {DbAction} dbAction
   */
  async findManyActions(
    options?: FindActionOptions,
    filters?: FindActionFilters
  ): Promise<Action[]> {
    const actions = await this.findMany(options, filters);

    return Promise.all(actions?.map((action) => this.deserialize(action)));
  }
}

export { Engine };
