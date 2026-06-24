export const productKeys = {
  pk: (slug: string) => `PRODUCT#${slug}`,
  sk: () => "META" as const,
  gsi1pk: (categorySlug: string) => `CATEGORY#${categorySlug}`,
  gsi1sk: (slug: string) => `PRODUCT#${slug}`,
};

export const categoryKeys = {
  pk: (slug: string) => `CATEGORY#${slug}`,
  sk: () => "META" as const,
};

export const userKeys = {
  pk: (userId: string) => `USER#${userId}`,
  profileSk: () => "PROFILE" as const,
  cartSk: () => "CART" as const,
  orderSk: (orderId: string) => `ORDER#${orderId}` as const,
};

export const leadKeys = {
  pk: (leadId: string) => `LEAD#${leadId}`,
  sk: () => "META" as const,
};

export const sessionKeys = {
  pk: (sessionId: string) => `SESSION#${sessionId}`,
  sk: () => "META" as const,
};

export const configKeys = {
  payments: { pk: "CONFIG#PAYMENTS", sk: "META" as const },
};
