import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, UsersIcon } from "@/components/Icons";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Turmas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    nivel: "",
    ano: new Date().getFullYear(),
    professorId: 0,
  });

  const { data: user } = trpc.auth.me.useQuery();
  const { data: turmas, isLoading, refetch } = trpc.turmas.getAll.useQuery();
  const { data: professores } = trpc.professores.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  
  const createTurmaMutation = trpc.turmas.create.useMutation({
    onSuccess: () => {
      toast.success("Turma criada com sucesso!");
      setIsCreateDialogOpen(false);
      refetch();
      setFormData({ nome: "", nivel: "", ano: new Date().getFullYear(), professorId: 0 });
    },
    onError: (error) => {
      toast.error(`Erro ao criar turma: ${error.message}`);
    },
  });

  const isAdmin = user?.role === "admin";

  const filteredTurmas = turmas?.filter((turma) =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTurma = () => {
    if (!formData.nome || !formData.nivel || !formData.professorId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createTurmaMutation.mutate(formData);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Turmas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as turmas e seus alunos
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2" size={18} />
                  Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da nova turma. As etapas padrão (30/35/35) serão criadas automaticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Turma *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: MED-1A"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível *</Label>
                    <Input
                      id="nivel"
                      placeholder="Ex: Intermediário"
                      value={formData.nivel}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ano">Ano *</Label>
                    <Input
                      id="ano"
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professor">Professor *</Label>
                    <Select
                      value={formData.professorId.toString()}
                      onValueChange={(value) => setFormData({ ...formData, professorId: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {professores?.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTurma} disabled={createTurmaMutation.isPending}>
                    {createTurmaMutation.isPending ? "Criando..." : "Criar Turma"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Turmas Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTurmas && filteredTurmas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTurmas.map((turma) => (
              <Link key={turma.id} href={`/turmas/${turma.id}`}>
                <Card className="card-hover cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon size={20} className="text-primary" />
                      {turma.nome}
                    </CardTitle>
                    <CardDescription>
                      {turma.nivel} • Ano {turma.ano}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={turma.ativa ? "text-green-600" : "text-red-600"}>
                          {turma.ativa ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Ver Detalhes →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="empty-state">
                <UsersIcon className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? "Nenhuma turma encontrada" : "Nenhuma turma cadastrada"}
                </p>
                <p className="text-sm">
                  {searchTerm
                    ? "Tente ajustar os filtros de busca"
                    : isAdmin
                    ? "Crie uma nova turma ou importe alunos via Excel"
                    : "Aguarde a atribuição de turmas pelo administrador"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
