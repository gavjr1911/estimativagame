# Regras do Jogo - Estimativa

## Visão Geral

Estimativa é um jogo de cartas onde os jogadores devem prever quantas rodadas irão vencer. A habilidade está em avaliar corretamente a força da sua mão e acertar a estimativa.

---

## 1. Materiais

- **Baralho:** 52 cartas (sem coringas)
- **Jogadores:** 2 a 10 pessoas
- **Acessório:** Este app para controle de pontuação

---

## 2. Hierarquia das Cartas

### 2.1 Força das Cartas (menor para maior)
```
2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A
```

### 2.2 Naipe Curinga (Trunfo)
- No início de cada rodada, uma carta é virada do baralho
- O naipe dessa carta se torna o **naipe curinga** da rodada
- Cartas do naipe curinga vencem qualquer carta de outros naipes
- Entre cartas do naipe curinga, vale a hierarquia normal

---

## 3. Estrutura das Rodadas

### 3.1 Cálculo do Número de Cartas

O jogo tem rodadas com quantidade crescente e depois decrescente de cartas:

**Máximo de cartas por jogador:**
```
máximo = floor(51 ÷ número_de_jogadores)
```
> Reservamos 1 carta para revelar o naipe curinga

**Sequência de rodadas:**
- **Subindo (pares):** 2, 4, 6, 8... até o máximo par ≤ máximo
- **Descendo (ímpares):** máximo-1, máximo-3, máximo-5... até 1

### 3.2 Exemplos por Número de Jogadores

| Jogadores | Máximo | Rodadas Subindo | Rodadas Descendo | Total |
|-----------|--------|-----------------|------------------|-------|
| 2 | 25 | 2,4,6,8,10,12,14,16,18,20,22,24 | 25,23,21,19,17,15,13,11,9,7,5,3,1 | 25 |
| 3 | 17 | 2,4,6,8,10,12,14,16 | 17,15,13,11,9,7,5,3,1 | 17 |
| 4 | 12 | 2,4,6,8,10,12 | 11,9,7,5,3,1 | 12 |
| 5 | 10 | 2,4,6,8,10 | 9,7,5,3,1 | 10 |
| 6 | 8 | 2,4,6,8 | 7,5,3,1 | 8 |
| 7 | 7 | 2,4,6 | 7,5,3,1 | 7 |
| 8 | 6 | 2,4,6 | 5,3,1 | 6 |
| 9 | 5 | 2,4 | 5,3,1 | 5 |
| 10 | 5 | 2,4 | 5,3,1 | 5 |

---

## 4. Fluxo de uma Rodada

### 4.1 Preparação
1. O **dealer** embaralha e distribui as cartas
2. Cada jogador recebe N cartas (conforme a rodada)
3. O dealer vira uma carta do baralho → define o **naipe curinga**

### 4.2 Fase de Estimativas
1. Começando pelo jogador à **direita do dealer**
2. Cada jogador declara quantas rodadas acredita que vai vencer
3. A estimativa vai de 0 até N (número de cartas)
4. Segue no sentido anti-horário até o dealer
5. Múltiplos jogadores podem estimar o mesmo número
6. A soma das estimativas pode ser maior ou menor que N

### 4.3 Fase de Jogo
1. O jogador à **esquerda do dealer** inicia jogando uma carta
2. A primeira carta define o **naipe da rodada**
3. Cada jogador deve seguir o naipe se tiver na mão
4. Se não tiver o naipe, pode:
   - Descartar qualquer carta (não vale nada)
   - Jogar uma carta do naipe curinga (ganha de tudo)
5. Vence a rodada:
   - Maior carta do naipe curinga jogado, OU
   - Maior carta do naipe da rodada (se ninguém jogou curinga)
6. Quem vence a rodada inicia a próxima
7. Repete até acabarem as cartas

### 4.4 Contagem
- Ao final, cada jogador conta quantas rodadas venceu
- Compara com a estimativa para calcular pontos

---

## 5. Sistema de Pontuação

### 5.1 Tabela de Pontos

| Resultado | Cálculo | Exemplo |
|-----------|---------|---------|
| **Acertou na mosca** | +10 × vitórias | Estimou 3, ganhou 3 → +30 pts |
| **Zero certeiro** | +5 pontos fixo | Estimou 0, ganhou 0 → +5 pts |
| **Errou** | -10 × diferença | Estimou 5, ganhou 3 → -20 pts |

### 5.2 Fórmula
```
SE estimativa == vitórias:
    SE vitórias == 0:
        pontos = +5
    SENÃO:
        pontos = +10 × vitórias
SENÃO:
    pontos = -10 × |estimativa - vitórias|
```

### 5.3 Exemplos de Pontuação

| Estimou | Ganhou | Cálculo | Pontos |
|---------|--------|---------|--------|
| 0 | 0 | Zero certeiro | +5 |
| 1 | 1 | 10 × 1 | +10 |
| 3 | 3 | 10 × 3 | +30 |
| 5 | 5 | 10 × 5 | +50 |
| 2 | 0 | -10 × 2 | -20 |
| 0 | 2 | -10 × 2 | -20 |
| 4 | 1 | -10 × 3 | -30 |
| 6 | 4 | -10 × 2 | -20 |

---

## 6. Rotação do Dealer

1. O primeiro dealer é definido no início do jogo
2. A cada rodada, o dealer muda
3. O próximo dealer é quem estava à direita do dealer atual
4. Isso significa: quem estimou primeiro vira o próximo dealer
5. A rotação continua no sentido horário

---

## 7. Fim do Jogo

- O jogo termina após a última rodada (rodada de 1 carta)
- Vence quem tiver mais pontos
- Em caso de empate, ambos são considerados vencedores

---

## 8. Dicas Estratégicas

1. **Cartas altas do naipe curinga** são praticamente vitórias garantidas
2. **Ases de outros naipes** são fortes, mas podem perder para curingas
3. **Estimar zero** é arriscado, mas rende pontos seguros (+5)
4. **Cartas médias** são as mais difíceis de avaliar
5. Observe as estimativas dos outros para ajustar sua estratégia durante o jogo
