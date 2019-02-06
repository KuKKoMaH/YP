import Validator from '../../js/Validator';

(() => {
  const $block = $('#form');

  const fieldNames = [
    { name: 'number', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'phone', type: 'phone', required: true },
    { name: 'email', type: 'email', required: true },
  ];

  const fields = fieldNames.map((field) => {
    const $input = $block.find('[name="' + field.name + '"]');
    const $wrapper = $input.parent();
    return {
      wrapper:  $wrapper,
      input:    $input,
      error:    $wrapper.find('.input__error'),
      type:     field.type,
      required: field.required
    };
  });

  new Validator({
    form:      $block.find('form'),
    classes:   {
      error: 'input__input--error'
    },
    fields,
    onSuccess: () => {
      $.magnificPopup.open({ type: 'inline', items: { src: '#success' } });
    }
  });
})();

(() => {
  const $block = $('#request');

  const fieldNames = [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'email', required: true },
  ];

  const fields = fieldNames.map((field) => {
    const $input = $block.find('[name="' + field.name + '"]');
    const $wrapper = $input.parent();
    return {
      wrapper:  $wrapper,
      input:    $input,
      error:    $wrapper.find('.input__error'),
      type:     field.type,
      required: field.required
    };
  });

  new Validator({
    form:      $block.find('form'),
    classes:   {
      error: 'input__input--error'
    },
    fields,
    onSuccess: () => {
      $.magnificPopup.open({ type: 'inline', items: { src: '#success' } });
    }
  });
})();




