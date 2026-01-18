import { Data, Schema } from "effect";

class BaseCategory extends Schema.Class<BaseCategory>("BaseCategory")({
  id: Schema.Number,
  name: Schema.String,
  icon: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromSelf,
}) {}

export class SystemCategory extends BaseCategory.extend<SystemCategory>(
  "SystemCategory",
)({
  isDefault: Schema.Boolean,
}) {}

export class Category extends BaseCategory.extend<Category>("Category")({
  userId: Schema.String,
  systemCategoryId: Schema.NullOr(Schema.Number),
  color: Schema.NullOr(Schema.String),
}) {}

export type SystemCategoryDTO = typeof SystemCategory.Encoded;
export type CategoryDTO = typeof Category.Encoded;

export class CategoryError extends Data.TaggedError("CategoryError")<{
  message: string;
}> {}
