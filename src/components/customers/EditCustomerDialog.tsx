import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from "@/types/pos";
import { useData } from "@/context/DataContext";
import { useToast } from "@/hooks/use-toast";

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onDelete?: (customer: Customer) => void;
}

const EditCustomerDialog = ({ open, onOpenChange, customer, onDelete }: EditCustomerDialogProps) => {
  const { updateCustomer } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        state: customer.state,
        birthday: customer.birthday,
        status: customer.status
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer || !formData.name || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedCustomer: Customer = {
      ...customer,
      name: formData.name,
      email: formData.email || '',
      phone: formData.phone,
      city: formData.city || '',
      state: formData.state || '',
      birthday: formData.birthday,
      status: formData.status || 'Active'
    };

    updateCustomer(customer.id, updatedCustomer);
    toast({
      title: "Success",
      description: "Customer updated successfully"
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (customer && onDelete) {
      onDelete(customer);
      onOpenChange(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Update customer information below
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              className="mt-1"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              className="mt-1"
              value={formData.phone || ''}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setFormData(prev => ({ ...prev, phone: value }));
              }}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              className="mt-1"
              value={formData.email || ''}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                placeholder="Enter city"
                className="mt-1"
                value={formData.city || ''}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-sm font-medium">State</Label>
              <Input
                id="state"
                placeholder="Enter state"
                className="mt-1"
                value={formData.state || ''}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="birthday" className="text-sm font-medium">Birthday (Optional)</Label>
            <Input
              id="birthday"
              type="date"
              className="mt-1"
              value={formData.birthday || ''}
              onChange={e => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
            />
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
            </div>
            <Button type="submit">
              Update Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;