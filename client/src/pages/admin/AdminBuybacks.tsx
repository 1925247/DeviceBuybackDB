import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from "@/components/admin/AdminLayout";

// Simple Buyback page displaying buyback requests
const AdminBuybacks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  const ITEMS_PER_PAGE = 10;

  // Fetch buyback requests data
  const { data: buybackRequests, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/buyback-requests', page, statusFilter, debouncedSearchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', ITEMS_PER_PAGE.toString());
      
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      if (debouncedSearchQuery) {
        queryParams.append('search', debouncedSearchQuery);
      }
      
      const response = await fetch(`/api/admin/buyback-requests?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch buyback requests');
      }
      const data = await response.json();
      
      // Update total pages
      if (data.total) {
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      }
      
      return data.requests || [];
    }
  });

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Handle View button click
  const handleViewBuyback = (id: number) => {
    navigate(`/admin/buybacks/${id}`);
  };

  // Create pagination items
  const getPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    // Page numbers
    const displayPages = getPageNumbersToShow(page, totalPages);
    
    displayPages.forEach((pageNumber, index) => {
      if (pageNumber === '...') {
        items.push(
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      } else {
        const pageNum = parseInt(pageNumber);
        items.push(
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => setPage(pageNum)}
              isActive={page === pageNum}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      }
    });
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    return items;
  };

  // Helper function to determine which page numbers to show
  const getPageNumbersToShow = (currentPage: number, totalPages: number) => {
    const delta = 2; // Number of pages to show on each side of current page
    const result = [];
    
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        result.push(i.toString());
      }
      return result;
    }
    
    // Always show first page
    result.push('1');
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - delta);
    let rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Adjust range if current page is near the beginning or end
    if (currentPage - delta <= 2) {
      rangeEnd = 1 + 2 * delta;
    } else if (currentPage + delta >= totalPages - 1) {
      rangeStart = totalPages - 2 * delta;
    }
    
    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      result.push('...');
    }
    
    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      result.push(i.toString());
    }
    
    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      result.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      result.push(totalPages.toString());
    }
    
    return result;
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 bg-red-50 text-red-800 rounded">
          Error loading buyback requests. Please try again later.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Buyback Requests</CardTitle>
              <Button 
                variant="default" 
                onClick={() => navigate('/admin/buybacks/new')}
              >
                Create New Request
              </Button>
            </div>
            <CardDescription>
              Manage all device buyback requests from customers
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search by customer name, email, device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Filter by status */}
              <div className="w-full md:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Refresh button */}
              <Button variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        {Array(7).fill(0).map((_, cellIndex) => (
                          <TableCell key={`cell-${index}-${cellIndex}`}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : buybackRequests?.length ? (
                    // Buyback requests data
                    buybackRequests.map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell>#{request.id}</TableCell>
                        <TableCell>
                          {request.customerName || 'N/A'}
                          {request.customerEmail && <div className="text-xs text-muted-foreground">{request.customerEmail}</div>}
                        </TableCell>
                        <TableCell>
                          {request.manufacturer && request.model ? (
                            <>
                              <div>{request.manufacturer}</div>
                              <div className="text-xs text-muted-foreground">{request.model}</div>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {request.finalPrice ? (
                            <span className="font-medium">₹{request.finalPrice}</span>
                          ) : request.offeredPrice ? (
                            <span className="text-muted-foreground">₹{request.offeredPrice}</span>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          {request.createdAt ? (
                            <span title={new Date(request.createdAt).toLocaleString()}>
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </span>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBuyback(request.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // No data
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No buyback requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          
          {totalPages > 1 && (
            <CardFooter>
              <div className="w-full">
                <Pagination>
                  <PaginationContent>
                    {getPaginationItems()}
                  </PaginationContent>
                </Pagination>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBuybacks;