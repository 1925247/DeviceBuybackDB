import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Edit, Trash2 } from "lucide-react";

interface PartnerStaff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  partnerId: number;
  partnerName: string;
  status: string;
}

const PartnerStaffManagement: React.FC = () => {
  const { data: staffMembers = [], isLoading } = useQuery<PartnerStaff[]>({
    queryKey: ["/api/partner-staff"],
    refetchOnWindowFocus: false,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ["/api/partners"],
    refetchOnWindowFocus: false,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<PartnerStaff | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "manager",
    partnerId: 0,
  });

  const { toast } = useToast();

  const handleAddStaff = () => {
    // In a real implementation, this would make an API call to add the staff member
    toast({
      title: "Staff Member Added",
      description: `${newStaff.name} has been added as a staff member.`,
    });
    setIsAddDialogOpen(false);
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "manager",
      partnerId: 0,
    });
  };

  const handleEditStaff = () => {
    // In a real implementation, this would make an API call to update the staff member
    toast({
      title: "Staff Member Updated",
      description: `${selectedStaff?.name} has been updated.`,
    });
    setIsEditDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleDeleteStaff = (staff: PartnerStaff) => {
    // In a real implementation, this would make an API call to delete the staff member
    toast({
      title: "Staff Member Removed",
      description: `${staff.name} has been removed from partner staff.`,
    });
  };

  // Sample data for demonstration
  const sampleStaffMembers: PartnerStaff[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@techrepair.com",
      phone: "9876543210",
      role: "Manager",
      partnerId: 1,
      partnerName: "TechRepair Solutions",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@techrepair.com",
      phone: "9876543211",
      role: "Technician",
      partnerId: 1,
      partnerName: "TechRepair Solutions",
      status: "active",
    },
    {
      id: 3,
      name: "Michael Johnson",
      email: "michael@gadgetfix.com",
      phone: "8765432109",
      role: "Manager",
      partnerId: 2,
      partnerName: "GadgetFix Center",
      status: "active",
    },
  ];

  const displayStaffMembers = staffMembers.length > 0 ? staffMembers : sampleStaffMembers;

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partner Staff Management</h1>
          <p className="text-gray-500 mt-1">
            Manage staff members for your partner organizations
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            View and manage staff members across all partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>List of partner staff members</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayStaffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>{staff.partnerName}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          staff.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteStaff(staff)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new staff member for a partner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newStaff.name}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={newStaff.email}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                className="col-span-3"
                value={newStaff.phone}
                onChange={(e) =>
                  setNewStaff({ ...newStaff, phone: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) =>
                  setNewStaff({ ...newStaff, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partner" className="text-right">
                Partner
              </Label>
              <Select
                value={newStaff.partnerId.toString()}
                onValueChange={(value) =>
                  setNewStaff({ ...newStaff, partnerId: parseInt(value) })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details of this staff member.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={selectedStaff.name}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  className="col-span-3"
                  value={selectedStaff.email}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  className="col-span-3"
                  value={selectedStaff.phone}
                  onChange={(e) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedStaff.role.toLowerCase()}
                  onValueChange={(value) =>
                    setSelectedStaff({ ...selectedStaff, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-partner" className="text-right">
                  Partner
                </Label>
                <Select
                  value={selectedStaff.partnerId.toString()}
                  onValueChange={(value) =>
                    setSelectedStaff({
                      ...selectedStaff,
                      partnerId: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id.toString()}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={selectedStaff.status}
                  onValueChange={(value) =>
                    setSelectedStaff({ ...selectedStaff, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerStaffManagement;