export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  sortOrder: number;
  children: CategorySummary[];
};

export function flattenCategories(categories: CategorySummary[]): CategorySummary[] {
  return categories.flatMap((category) => [
    {
      ...category,
      children: [],
    },
    ...flattenCategories(category.children),
  ]);
}
