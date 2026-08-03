# Tasks do Front-end

## Status

- [ ] A fazer
- [~] Em andamento
- [x] Concluído

---

# Validação de Dados

- [x] Validar tamanho do nome (mínimo de 5 caracteres).
- [x] Impedir o uso de caracteres especiais no nome do usuário.
- [x] Não permitir confirmar presença se o evento já tiver passado (exemplo: hoje é 08/08 e a pessoa quer confirmar presença no dia 09/08).
- [x] Exibir um badge vermelho (experimentar usar o componente do shadcnui com classname destructive) informando que o evento já passou.

---

# Infraestrutura / Qualidade

- [ ] Criar CI no GitHub Actions (lint + typecheck no frontend, testes no backend, rodando em todo PR).
- [ ] Escrever testes automatizados (backend: apps/*; frontend: fluxo de RSVP, login, criação de evento).
- [x] Revisar acessibilidade (aria-label em botões só com ícone, foco, contraste).
- [ ] Extrair componente/hook comum para estados de loading/erro (padrão repetido em várias páginas).
- [ ] Verificar rate limiting/throttle nos endpoints públicos (/invite/:token, /convite/:token).
