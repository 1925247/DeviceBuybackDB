// src/pages/shop.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ShopPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Refurbished Devices Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Shop our collection of certified pre-owned and refurbished devices. Every purchase
          helps reduce electronic waste and supports sustainable technology use.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Browse Our Collection</CardTitle>
            <CardDescription>Find the perfect device for your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We offer a wide range of certified pre-owned smartphones, tablets, laptops, and more.
              All devices are thoroughly tested and refurbished to ensure quality performance.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/shop/products")} className="w-full">
              View Products
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
            <CardDescription>Make a difference with your purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              By purchasing a refurbished device, you're helping reduce electronic waste and
              conserving valuable resources. See the positive impact you're making with every
              purchase.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/shop/products")} className="w-full">
              Start Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-8">
        <Button size="lg" onClick={() => navigate("/shop/products")}>
          Browse All Products
        </Button>
      </div>
    </div>
  );
};

export default ShopPage;