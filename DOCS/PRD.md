# PRD - Documento de Requisitos do Produto

## Estimativa - Placar Digital

**Versão:** 1.0
**Data:** 27/12/2024
**Status:** Em Planejamento

---

## 1. Visão Geral

### 1.1 O que é?
Aplicativo web responsivo (PWA) para controlar a pontuação do jogo de cartas "Estimativa". Não é o jogo em si, mas um placar digital inteligente que automatiza o cálculo de pontos e gerencia o fluxo das rodadas.

### 1.2 Problema que Resolve
- Elimina cálculos manuais de pontuação
- Evita erros de contagem de rodadas
- Automatiza a ordem de jogadores e dealer
- Mantém histórico de partidas
- Funciona offline (ideal para jogos em locais sem internet)

### 1.3 Público-Alvo
Grupos de amigos e família que jogam Estimativa e querem uma forma prática de controlar a pontuação.

---

## 2. Requisitos Funcionais

### 2.1 Cadastro de Partida
- [ ] Informar número de jogadores (2-10)
- [ ] Cadastrar nome de cada jogador
- [ ] Definir posição na mesa (ordem circular)
- [ ] Definir quem será o primeiro dealer
- [ ] Sistema calcula automaticamente o número de rodadas

### 2.2 Fluxo de Rodada
- [ ] Exibir número da rodada atual
- [ ] Exibir quantidade de cartas a serem distribuídas
- [ ] Indicar quem é o dealer da rodada
- [ ] Indicar ordem de estimativa (a partir da direita do dealer)
- [ ] Coletar estimativa de cada jogador (0 até N cartas)
- [ ] Validar: estimativa não pode exceder número de cartas
- [ ] Permitir edição das estimativas até confirmar início da rodada
- [ ] Após jogadas, coletar número de vitórias de cada jogador
- [ ] Calcular pontuação automaticamente
- [ ] Exibir placar atualizado

### 2.3 Cálculo de Rodadas
- [ ] Baralho: 52 cartas (sem coringas)
- [ ] Máximo de cartas por jogador: `floor(51 / numJogadores)`
- [ ] Subindo: 2, 4, 6, 8... (pares até o máximo)
- [ ] Descendo: máximo-1, máximo-3, máximo-5... (ímpares até 1)
- [ ] Reservar 1 carta para o naipe curinga

### 2.4 Cálculo de Pontuação
| Situação | Fórmula |
|----------|---------|
| Acertou estimativa | +10 × número de vitórias |
| Estimou zero, ganhou zero | +5 pontos |
| Errou estimativa | -10 × |estimativa - vitórias| |

### 2.5 Gestão do Dealer
- [ ] Dealer inicial definido pelo usuário
- [ ] Dealer rota automaticamente a cada rodada (sentido horário)
- [ ] Próximo dealer = quem estimou primeiro na rodada anterior

### 2.6 Histórico e Persistência
- [ ] Salvar partida em andamento (retomar se fechar app)
- [ ] Salvar histórico de partidas finalizadas
- [ ] Exibir ranking de partidas anteriores
- [ ] Permitir visualizar detalhes de partidas passadas

### 2.7 Finalização
- [ ] Detectar automaticamente última rodada
- [ ] Exibir placar final com ranking
- [ ] Destacar vencedor(es) - permite empate
- [ ] Opção de iniciar nova partida

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance
- Carregamento inicial < 3 segundos
- Transições suaves (60fps)
- Funcionar em dispositivos modestos

### 3.2 Disponibilidade
- Funcionar 100% offline após primeiro acesso
- PWA instalável em dispositivos móveis
- Sem dependência de servidor para MVP

### 3.3 Compatibilidade
- Navegadores modernos (Chrome, Safari, Firefox, Edge)
- Responsivo: mobile-first, funcionar em tablets e desktop
- Mínimo: iOS 14+, Android 8+

### 3.4 Usabilidade
- Interface intuitiva, mínimo de cliques
- Feedback visual claro para ações
- Prevenção de erros (validações)
- Possibilidade de corrigir entradas

---

## 4. Fora de Escopo (MVP)

- Multiplayer em rede (cada jogador em seu dispositivo)
- Autenticação de usuários
- Sincronização na nuvem
- Estatísticas avançadas por jogador
- Modo espectador
- Chat entre jogadores
- Animações elaboradas de cartas

---

## 5. Métricas de Sucesso

- App funciona offline sem erros
- Cálculo de pontuação 100% correto
- Partida pode ser retomada após fechar app
- Tempo médio para registrar uma rodada < 30 segundos

---

## 6. Roadmap Futuro (Pós-MVP)

### Fase 2 - Multiplayer Local
- Cada jogador abre em seu dispositivo
- Comunicação via rede local (WebSocket)
- Jogador vê apenas sua estimativa e placar

### Fase 3 - Multiplayer Online
- Sincronização via Supabase/Firebase
- Salas de jogo com código
- Persistência na nuvem

### Fase 4 - Recursos Avançados
- Estatísticas históricas por jogador
- Conquistas e badges
- Torneios
- Temas personalizáveis
