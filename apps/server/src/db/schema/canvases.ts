import type { CanvasDraft, CanvasType, UmlSubtype } from "@trace/shared";
import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { project } from "./projects";

export const canvas = pgTable(
  "canvas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").$type<CanvasType>().notNull(),
    subtype: text("subtype").$type<UmlSubtype>(),
    draft: jsonb("draft").$type<CanvasDraft>().notNull(),
    yjsState: customType<{ data: Buffer }>({ dataType: () => "bytea" })(
      "yjs_state",
    ),
    revision: integer("revision").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("canvas_project_idx").on(table.projectId)],
);
