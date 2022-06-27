window.onload = function () {
   const detailsWrapper = document.querySelectorAll('[data-id]');
   //Карта корзины!
   const cartWrapper = document.querySelector('.cart-wrapper'),
      totalPrice = document.querySelector('.total-price'),
      deliveryCost = document.querySelector('.delivery-cost'),
      dataCartEmpty = document.querySelector('[data-cart-empty]');
   let order = {};
   //Форма отправки 
   const form = document.querySelector('form'),
      inputForm = document.querySelector('.form-control'),
      invalide = document.querySelector('.invalide'),
      submitBtn = document.querySelector('.btn-submit'),
      // regexBel = /^(\+375|375)?[\s\-]?\(?[0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
      regexRu = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
   //Перебираем все доступные Суши/Роллы
   for (let i = 0; i < detailsWrapper.length; i++) {
      //Запускаем функцию на обработку данных
      detailWrapper(detailsWrapper[i], i);
      //----------
   }
   //----------
   function detailWrapper(items, i) {
      const item = items.querySelector(".card-body "),
         counterWrapper = item.querySelector('.counter-wrapper'),
         dataCounter = counterWrapper.querySelector('[data-counter]'),
         addDraft = item.querySelector('[data-cart]');
      //Событие на увеличение/уменьшение счетчика
      counterWrapper.addEventListener('click', cartFunction);
      // Функиции карточки
      function cartFunction(e) {
         //Определяем на что нажали
         const target = e.target,
            closest = target.closest('.counter-wrapper').querySelector('[data-counter]'),
            //Проверка на наличие в корзине!
            checkItem = target.closest('.cart-item');
         //В зависимости от нажатой кнопки + или - к couners
         if (target.dataset.action == 'minus') {
            //Если изменения в корзине
            if (checkItem) {
               --order[checkItem.dataset.id].curent;
               fullPrice();
               if (order[checkItem.dataset.id].curent < 1) {
                  delete order[checkItem.dataset.id];
                  fullPrice();
                  checkItem.remove();
                  amptyDraft();
                  return;
               }
            };
            //------
            if (closest.innerHTML > 1) {
              --closest.innerHTML; 
            };
         } else if (target.dataset.action == 'plus') {
            if (checkItem) {
               ++order[checkItem.dataset.id].curent;
               fullPrice();
            };
            ++closest.innerHTML;
         };
      };
      //---------
      // Слушатель события на добавления в корзину
      addDraft.addEventListener('click', addOrder);
      //--------
      //Функия добавления в корзину заказа
      function addOrder() {
         // ID товара
         const id = items.dataset.id;
         //------------
         //Объект с информацие о заказе
         let draftOrder;
         //------------
         //Проверка  добавлен ли в карзину
         if (id in order) {
            //Если добвлен, перезаписать кол-во и установить новое
            //Добовляем к заказу
            order[id].curent += +item.querySelector('.items__current').innerHTML;
            //------------
            //Вводим новое значени в Curent 
            cartWrapper.querySelector(`[data-id="${id}"]`).querySelector('[data-counter]').innerHTML = order[id].curent;
            //------------
         } else {
            //Создание и добавление в карзину 
            //Информаци о заказе
            const name = item.querySelector('.item-title').innerHTML,
               imgSrc = items.querySelector('.product-img').attributes[1].value,
               curent = Number(item.querySelector('.items__current').innerHTML),
               price = Number(item.querySelector('.price__currency').innerHTML.replace(' ₽', '')),
               inBox = item.querySelector('[data-items-in-box]').innerHTML + ' / ' + item.querySelector('.price__weight').innerHTML;
            draftOrder = {
               name: name,
               imgSrc: imgSrc,
               curent: curent,
               price: price,
               inBox: inBox,
            };
            //------------
            //Добавление в объект для сервера
            order[id] = draftOrder;
            //------------
            //шаблон для вывода
            const innerHTML = `<div class="cart-item" data-id="${id}">
         <div class="cart-item__top">
            <div class="cart-item__img">
               <img src="${order[id].imgSrc}" alt="${order[id].name}">
            </div>
            <div class="cart-item__desc">
               <div class="cart-item__title">${order[id].name}</div>
               <div class="cart-item__weight"></div>

      <div class="cart-item__details">

                  <div class="items items--small counter-wrapper">
                     <div class="items__control" data-action="minus">-</div>
                     <div class="items__current" data-counter>${order[id].curent}</div>
                     <div class="items__control" data-action="plus">+</div>
                  </div>

                  <div class="price">
                     <div class="price__currency">${order[id].price} ₽</div>
                  </div>

               </div>`;
            //------------
            //вывод в html
            cartWrapper.insertAdjacentHTML('beforeend', innerHTML);
            //------------
            //Перебираем и присваеваем каждому слушателя
            cartWrapper.querySelector(`[data-id="${id}"]`).addEventListener('click', cartFunction);
            amptyDraft();
         }
         fullPrice();
      };
      //----------------------
   };
   //Подсчёт полной стоимости товара(-ов)
   function fullPrice() {
      let fullprice = 0;
      //Вычисление полной стоимости корзины
      for (item in order) {
         fullprice = fullprice + order[item]?.price * order[item]?.curent;
      };
      //---------
      //Вывод полной стоимости корзины
      totalPrice.innerHTML = fullprice;
      //---------
      //Условие при котором доставка будет бесплатной
      if (fullprice > 1000) {
         deliveryCost.innerHTML = "Бесплатно",
            deliveryCost.classList.add('free');
         return;
      }
      deliveryCost.innerHTML = "Платно";
      deliveryCost.classList.remove('free');
   }
   fullPrice();
   //Проверка на путоту корзины!
   function amptyDraft() {
      if (!Object.values(order).length > 0) {
         submitBtn.setAttribute('disabled', 'disabled');
         dataCartEmpty.classList.remove('none');
         return false;
      }
      submitBtn.removeAttribute('disabled', 'disabled');
      dataCartEmpty.classList.add('none');
   }
   amptyDraft();
   //Отправка формы 
   form.addEventListener('submit', handleFormSubmit);

   function handleFormSubmit(event) {
      event.preventDefault();
      const inputValue = inputForm.value;
      if (!regexRu.test(inputValue)) {
         inputForm.classList.add('is-invalid');
         invalide.classList.remove('none');
         return false;
      }
      inputForm.classList.remove('is-invalid');
      invalide.classList.add('none');
      setTimeout(function () {
         alert('Заказ принят на обратоку!');
         inputForm.value = '';
         cartWrapper.innerHTML = '';
         order = {};
         fullPrice();
         amptyDraft();
      }, 1000)
   }
}
