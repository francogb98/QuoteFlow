"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  estado: string;
  estaActivo: boolean;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserData[];
}

export function UserSearchModal({
  isOpen,
  onClose,
  users,
}: UserSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredUsers = users.filter(
    (user) =>
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.documento.includes(searchTerm)
  );

  const handleUserClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
    onClose();
    setSearchTerm("");
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">
            Buscar Usuario
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
            <Input
              placeholder="Buscar por apellido, nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto hover:bg-emerald-50 hover:border-emerald-200 border border-transparent"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        Doc: {user.documento}
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {searchTerm
                  ? "No se encontraron usuarios"
                  : "Escribe para buscar usuarios"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
