import 'selectize';

$('.input__input')
  .on('focus', (e) => {
    const $el = $(e.delegateTarget);
    $el.parents('.input').addClass('input--focus');
  })
  .on('blur', (e) => {
    const $el = $(e.delegateTarget);
    setTimeout(() => {
      if (!$el.val()) $el.parents('.input').removeClass('input--focus');
    }, 0);
  });

if (!window.CATALOG_URL) throw new Error('CATALOG_URL not found.');

var parentage = {
  brand: 'model',
  model: 'generation'
};

var selectizeConfig = {
  allowEmptyOption: true,
  labelField:       'title',
  valueField:       'title',
  searchField:      ['title'],
  sortField:        'title',
  onChange:         function (title) {

    var type = this.$input.data('type');
    var child = parentage[type];
    if (!child) return;

    var form = this.$wrapper.parents('form');
    var $child = form.find('[data-type="' + child + '"]');
    if (!$child.length) return;

    if (!title) $child[0].selectize.disable();
    clearChilds(form, type);

    var value = this.options[title];
    if (!value) return;

    $child[0].selectize.load(function (cb) {
      $.get(CATALOG_URL[child], { parent: value.id }, cb);
    });
    $child[0].selectize.enable();
  }
};

$('.form__wrapper').on('submit', function (e) {
  e.preventDefault();
  var $form = $(this);
  var $popup = $("#request");
  var fields = getForm($form);

  console.log(fields);

  $.magnificPopup.open({
    items: {
      type: 'inline',
      src:  '#request'
    }
  });

  var $brand = $popup.find('[name="brand"]').data('selectize');
  var $model = $popup.find('[name="model"]').data('selectize');
  var $generation = $popup.find('[name="generation"]').data('selectize');

  if (fields.brand) {
    $brand.setValue(fields.brand);

    if (fields.model) {
      var updateModel = function () {
        $model.off('load', updateModel);
        $model.setValue(fields.model);

        if (fields.generation) {
          var updateGeneration = function () {
            $generation.off('load', updateGeneration);
            $generation.setValue(fields.generation);
          };
          $generation.on('load', updateGeneration);
        }
      };
      $model.on('load', updateModel);
    }
  }

  var setField = function (key, value) {
    var $input = $popup.find('[name="' + key + '"]').data('selectize');
    $input.setValue(value);
  };
  if (fields.body) setField('body', fields.body);
  if (fields.part) setField('part', fields.part);

  return false;
});

$('.form__select').selectize(selectizeConfig);

$.get(CATALOG_URL.brand, function (res) {
  $('.form__select[data-type="brand"]').each(function () {
    this.selectize.load(function (cb) {
      cb(res);
    });
    this.selectize.enable();
  })
});

$.get(CATALOG_URL.body, function (res) {
  $('.form__select[data-type="body"]').each(function () {
    this.selectize.load(function (cb) {
      cb(res);
    });
    this.selectize.enable();
  })
});

$.get(CATALOG_URL.part, function (res) {
  $('.form__select[data-type="part"]').each(function () {
    this.selectize.load(function (cb) {
      cb(res);
    });
    this.selectize.enable();
  })
});

function getForm($form) {
  var fields = $form.serializeArray();
  var res = {};
  for (var i = 0; i < fields.length; i++) {
    res[fields[i].name] = fields[i].value;
  }
  return res;
}

function formatText(form) {
  if ($.isEmptyObject(form)) return '';
  var text = 'Вы выбрали: ';
  if (form.count) text += form.count;
  if (form.brand || form.model || form.generation || form.body) text += ' на ';
  if (form.brand) text += form.brand + ' ';
  if (form.model && !form.generation) text += form.model + ' ';
  if (form.generation) text += form.generation + ' ';
  if (form.body) text += form.body;
  return text;
}

function clearChilds(form, type) {
  var child = type;
  while (child = parentage[child]) {
    var $child = form.find('[data-type="' + child + '"]');
    $child[0].selectize.setValue();
  }
}