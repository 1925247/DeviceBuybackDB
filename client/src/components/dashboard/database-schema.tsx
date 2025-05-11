import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DatabaseSchema() {
  const tables = [
    {
      name: "devices",
      count: 14,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "name", type: "VARCHAR(255)" },
        { name: "manufacturer", type: "VARCHAR(100)" },
        { name: "model", type: "VARCHAR(100)" },
        { name: "condition", type: "VARCHAR(50)" },
        { name: "price", type: "DECIMAL(10,2)" },
        { name: "seller_id", type: "INT REFERENCES users(id)" },
        { name: "more", type: "+" }
      ]
    },
    {
      name: "users",
      count: 32,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "email", type: "VARCHAR(255) UNIQUE" },
        { name: "password_hash", type: "VARCHAR(255)" },
        { name: "first_name", type: "VARCHAR(100)" },
        { name: "last_name", type: "VARCHAR(100)" },
        { name: "role", type: "VARCHAR(20)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "more", type: "+" }
      ]
    },
    {
      name: "orders",
      count: 27,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "buyer_id", type: "INT REFERENCES users(id)" },
        { name: "seller_id", type: "INT REFERENCES users(id)" },
        { name: "device_id", type: "INT REFERENCES devices(id)" },
        { name: "status", type: "VARCHAR(50)" },
        { name: "total_amount", type: "DECIMAL(10,2)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "more", type: "+" }
      ]
    },
    {
      name: "buyback_requests",
      count: 19,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "user_id", type: "INT REFERENCES users(id)" },
        { name: "device_type", type: "VARCHAR(100)" },
        { name: "manufacturer", type: "VARCHAR(100)" },
        { name: "model", type: "VARCHAR(100)" },
        { name: "condition", type: "VARCHAR(50)" },
        { name: "offered_price", type: "DECIMAL(10,2)" },
        { name: "more", type: "+" }
      ]
    },
    {
      name: "marketplace_listings",
      count: 22,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "device_id", type: "INT REFERENCES devices(id)" },
        { name: "title", type: "VARCHAR(255)" },
        { name: "description", type: "TEXT" },
        { name: "price", type: "DECIMAL(10,2)" },
        { name: "status", type: "VARCHAR(50)" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "more", type: "+" }
      ]
    },
    {
      name: "device_images",
      count: 56,
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY" },
        { name: "device_id", type: "INT REFERENCES devices(id)" },
        { name: "url", type: "VARCHAR(255)" },
        { name: "is_primary", type: "BOOLEAN" },
        { name: "created_at", type: "TIMESTAMP" },
        { name: "updated_at", type: "TIMESTAMP" }
      ]
    }
  ];

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden mb-8">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">Database Schema Overview</CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Key tables and their relationships in the PostgreSQL database.</p>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <div key={table.name} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-medium text-gray-900">{table.name}</h4>
                <span className="text-xs text-gray-500">{table.count} records</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                {table.columns.map((column, idx) => (
                  <li key={idx}>
                    {column.name === "more" ? (
                      <span className="text-gray-400">+ {column.type} more columns</span>
                    ) : (
                      <>
                        <span className="font-medium text-gray-800">{column.name}</span> - {column.type}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
