import { db } from "@/lib/db";
import type { ClientFormData } from "@/types";

export class ClientService {
  /**
   * Create a new client
   */
  static async create(userId: string, data: ClientFormData) {
    return db.client.create({
      data: {
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || "US",
        notes: data.notes,
      },
    });
  }

  /**
   * Get client by ID
   */
  static async getById(clientId: string, userId: string) {
    return db.client.findFirst({
      where: {
        id: clientId,
        userId,
      },
    });
  }

  /**
   * Get all clients for a user
   */
  static async getAll(
    userId: string,
    options?: {
      search?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    const { search, page = 1, pageSize = 50 } = options || {};

    const where = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.client.count({ where }),
    ]);

    return {
      items: clients,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Update client
   */
  static async update(clientId: string, userId: string, data: Partial<ClientFormData>) {
    return db.client.update({
      where: {
        id: clientId,
        userId,
      },
      data,
    });
  }

  /**
   * Delete client
   */
  static async delete(clientId: string, userId: string) {
    return db.client.delete({
      where: {
        id: clientId,
        userId,
      },
    });
  }
}
