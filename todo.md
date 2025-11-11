# SAS English - TODO Final

## Implementações Finais

### 1. Exportação DOCX no Relatório por Turma
- [x] Adicionar import de exportarRelatorioTurmaDocx no RelatorioTurma.tsx
- [x] Adicionar botão "Exportar para Word" no RelatorioTurma.tsx
- [x] Preparar dados da turma para exportação (alunos, notas, médias)
- [x] Testar exportação DOCX do relatório por turma

### 2. Permissões de Edição Granulares
- [x] Criar função canEditTurma de verificação de permissões no backend
- [x] Adicionar verificação: admin pode editar tudo
- [x] Adicionar verificação: professor responsável pode editar sua turma
- [x] Bloquear outros professores com mensagem clara
- [ ] Aplicar permissões em mutations de: turmas, atividades, notas, feedbacks
- [ ] Testar permissões com diferentes usuários

### 3. Testes e Validação
- [ ] Verificar se seed-admin.mjs está funcionando
- [ ] Testar login com admin@sas.com / admin123
- [ ] Validar todas as funcionalidades principais
- [ ] Gerar checkpoint e ZIP final
