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

import z from "zod";

const ActionSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string(),
  companyId: z.string().optional(),
  clientId: z.string().optional(),
  app: z.string().optional(),
  environment: z.string().optional(),
  framework: z
    .object({
      name: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),
  sessionId: z.string().optional(),
  traceIds: z.array(z.string()).optional(),
  action: z.object({
    id: z.string().optional(),
    type: z.string(),
    verb: z.string(),
    object: z.string().optional(),
  }),
  agents: z.array(
    z.object({
      id: z.string().optional(),
      type: z.string(),
      name: z.string().optional(),
      meta: z.record(z.string(), z.any()).optional(),
    })
  ),
  targets: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string(),
        name: z.string().optional(),
        meta: z.record(z.string(), z.any()).optional(),
      })
    )
    .optional(),
  request: z.record(z.string(), z.any()).optional(),
  response: z
    .object({
      status: z.string().optional(),
      time: z.number().optional(),
      body: z.record(z.string(), z.any()).optional(),
      headers: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  changes: z
    .array(
      z.object({
        model: z.string(),
        operation: z.string(), // create, update, delete, read
        id: z.string().optional(),
        path: z.string().optional(),
        before: z.any().optional(),
        after: z.any().optional(),
        meta: z.record(z.string(), z.any()).optional(),
      })
    )
    .optional(),
  cost: z
    .object({
      amount: z.number(),
      currency: z.string(),
      components: z
        .array(
          z.object({
            type: z.string().optional(),
            key: z.string(),
            amount: z.number(),
          })
        )
        .optional(),
      meta: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

const FindActionOptionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

const FindActionFiltersSchema = z.object({
  companyId: z.string(), // required
  start: z.string().datetime({ offset: true }).optional(),
  end: z.string().datetime({ offset: true }).optional(),
  query: z.string().optional(), // generic multi-field query
  id: z.string().or(z.array(z.string())).optional(),
  clientId: z.string().or(z.array(z.string())).optional(),
  app: z.string().or(z.array(z.string())).optional(),
  environment: z.string().or(z.array(z.string())).optional(),
  framework: z
    .object({
      name: z.string().optional(),
      version: z.string().optional(),
    })
    .or(
      z.array(
        z.object({
          name: z.string().optional(),
          version: z.string().optional(),
        })
      )
    )
    .optional(),
  sessionId: z.string().or(z.array(z.string())).optional(),
  traceIds: z.string().or(z.array(z.string())).optional(),
  action: z
    .object({
      id: z.string().optional(),
      type: z.string().optional(),
      verb: z.string().optional(),
      object: z.string().optional(),
    })
    .or(
      z.array(
        z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          verb: z.string().optional(),
          object: z.string().optional(),
        })
      )
    )
    .optional(),
  agents: z
    .object({
      id: z.string().optional(),
      type: z.string().optional(),
      name: z.string().optional(),
      meta: z.record(z.string(), z.string()).optional(),
    })
    .or(
      z.array(
        z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          name: z.string().optional(),
          meta: z.record(z.string(), z.string()).optional(),
        })
      )
    )
    .optional(),
  targets: z
    .object({
      id: z.string().optional(),
      type: z.string().optional(),
      name: z.string().optional(),
      meta: z.record(z.string(), z.string()).optional(),
    })
    .or(
      z.array(
        z.object({
          id: z.string().optional(),
          type: z.string().optional(),
          name: z.string().optional(),
          meta: z.record(z.string(), z.string()).optional(),
        })
      )
    )
    .optional(),
  request: z
    .record(z.string(), z.string().or(z.record(z.string(), z.string())))
    .or(
      z.array(
        z.record(z.string(), z.string().or(z.record(z.string(), z.string())))
      )
    )
    .optional(),
  response: z
    .object({
      status: z.string().or(z.array(z.string())).optional(),
      time: z
        .object({
          gte: z.number().optional(),
          lt: z.number().optional(),
        })
        .optional(),
      body: z
        .record(z.string(), z.string())
        .or(z.array(z.record(z.string(), z.string())))
        .optional(),
      headers: z
        .record(z.string(), z.string())
        .or(z.array(z.record(z.string(), z.string())))
        .optional(),
    })
    .optional(),
  changes: z
    .object({
      model: z.string().optional(),
      operation: z.string().optional(),
      id: z.string().optional(),
      path: z.string().optional(),
      before: z.any().optional(),
      after: z.any().optional(),
      meta: z.record(z.string(), z.string()).optional(),
    })
    .or(
      z.array(
        z.object({
          model: z.string().optional(),
          operation: z.string().optional(),
          id: z.string().optional(),
          path: z.string().optional(),
          before: z.any().optional(),
          after: z.any().optional(),
          meta: z.record(z.string(), z.string()).optional(),
        })
      )
    )
    .optional(),
  meta: z
    .record(z.string(), z.string())
    .or(z.array(z.record(z.string(), z.string())))
    .optional(),
});

type Action = z.infer<typeof ActionSchema>;
type FindActionOptions = z.infer<typeof FindActionOptionsSchema>;
type FindActionFilters = z.infer<typeof FindActionFiltersSchema>;

export {
  Action,
  FindActionOptions,
  FindActionFilters,
  ActionSchema,
  FindActionOptionsSchema,
  FindActionFiltersSchema,
};
