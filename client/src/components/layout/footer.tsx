export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center">
            <span className="font-bold text-xl text-primary">GadgetSwap</span>
            <span className="ml-2 text-sm text-gray-500">Database Implementation v1.2.0</span>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">Connected to PostgreSQL Database</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
