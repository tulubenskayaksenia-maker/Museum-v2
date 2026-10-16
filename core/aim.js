// =====================================================
// AIM / POINTER LOCK
// core/aim.js
// =====================================================
//
// Один общий переключатель для управления мышью на компьютере.
//
//   USE_POINTER_LOCK = true
//     Клик по сцене «захватывает» мышь: курсор пропадает,
//     в центре экрана появляется прицел, камера крутится
//     без упора в край экрана. Esc отпускает мышь.
//
//   USE_POINTER_LOCK = false
//     Старое поведение: свободный курсор.
//
// Если что-то пойдёт не так — просто поставь false.

export const USE_POINTER_LOCK = false;

/*
  Когда мышь захвачена, браузер перестаёт обновлять
  event.clientX / event.clientY. Любой модуль, который
  определяет объект «под курсором», должен брать
  координаты отсюда — тогда он целится в центр экрана.
*/
export function getAimPoint(event) {
  if (
    USE_POINTER_LOCK &&
    document.pointerLockElement
  ) {
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  return {
    x: event.clientX,
    y: event.clientY
  };
}
