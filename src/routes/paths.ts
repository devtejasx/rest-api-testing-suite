/** Application route paths — single source of truth for navigation. */
export const paths = {
  dashboard: "/",
  collections: "/collections",
  collectionDetail: (id = ":id") => `/collections/${id}`,
  execution: "/execution",
  reports: "/reports",
  reportDetail: (id = ":id") => `/reports/${id}`,
  cicd: "/cicd",
  docker: "/docker",
  settings: "/settings",
} as const;
