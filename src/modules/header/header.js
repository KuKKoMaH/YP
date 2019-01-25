const $menu = $('.header__mobile-menu');

$('.header__menu-btn').on('click', () => {
  $menu.addClass('header__mobile-menu--active');
});

$('.header__menu-close').on('click', () => {
  $menu.removeClass('header__mobile-menu--active');
});

const $window = $(window);
let fixed = false;
const onScroll = () => {
  const scrollTop = $window.scrollTop();
  const offset = 35 - 8;
  if (scrollTop > offset && !fixed) {
    $('header').addClass('header--fixed');
    fixed = true;
  } else if (scrollTop < offset && fixed) {
    $('header').removeClass('header--fixed');
    fixed = false;
  }
};
$window.on('scroll', onScroll);
onScroll();
