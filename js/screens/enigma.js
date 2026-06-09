export function renderEnigma(fase, state, persist, handlers) {
  document.getElementById('screen-enigma').innerHTML =
    `<div class="p-6 text-center"><p>Enigma ${fase} em construção</p>
     <button id="stub-back" class="underline">voltar</button></div>`;
  document.getElementById('stub-back').addEventListener('click', handlers.onBack);
}
