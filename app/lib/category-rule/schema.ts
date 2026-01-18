import { Schema } from "effect";

class BaseRule extends Schema.Class<BaseRule>("BaseRule")({
  id: Schema.Number,
  keywords: Schema.Array(Schema.String),
  createdAt: Schema.DateFromSelf,
}) {}

export class SystemCategoryRule extends BaseRule.extend<SystemCategoryRule>(
  "SystemCategoryRule",
)({
  systemCategoryId: Schema.Number,
}) {}

export class CategoryRule extends BaseRule.extend<CategoryRule>("CategoryRule")({
  userId: Schema.String,
  categoryId: Schema.Number,
}) {}

export type SystemCategoryRuleDTO = typeof SystemCategoryRule.Encoded;
export type CategoryRuleDTO = typeof CategoryRule.Encoded;
