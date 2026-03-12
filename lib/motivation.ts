export const completionMessages = [
  "Boa. Rota registrada.",
  "Feito. Bora pra próxima.",
  "Show. Mais uma concluída.",
  "Mandou bem. Operação atualizada.",
  "Tudo certo. Seguimos.",
  "Excelente. Check-in salvo.",
  "Perfeito. Mais uma sala atualizada.",
  "Muito bom. A operação está avançando."
];

export function getRandomCompletionMessage() {
  const index = Math.floor(Math.random() * completionMessages.length);
  return completionMessages[index];
}
