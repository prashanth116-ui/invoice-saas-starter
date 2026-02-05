import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Mail, Phone, Building } from "lucide-react";
import { ClientService } from "@/lib/services/client.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const result = await ClientService.getAll(userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client list</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Client List */}
      {result.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No clients yet</p>
            <Button asChild>
              <Link href="/clients/new">Add your first client</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.items.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                  {client.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Building className="h-4 w-4" />
                      {client.company}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
