<?php
//error_reporting(0);
mb_internal_encoding("UTF-8");

$email_from = 'kadastr@srgroup.ru';
$email_from_name = 'Группа компаний SRG';
$email_to = 'kadastr@srgroup.ru';

$forms = array(
  'calc' => array('name', 'email', 'phone', 'number'),
  'request' => array('name', 'email')
);

$forms_names = array(
  'calc' => 'Заявка на рассчет',
  'request' => 'Запрос документов'
);
$fields_names = array(
  'name' => "Имя",
  'phone' => "Телефон",
  'email' => "Email",
  'number' => "Кадастровый номер"
);

$fields_errors = array(
  'name' => "Обязательное поле",
  'phone' => "Неправильный формат телефона",
  'email' => "Неправильный формат email",
  'number' => "Обязательное поле",
);

$back_email = array(
  'calc' => array('template' => 'calc.html', 'subject' => 'Рассчет кадастровой стоимости.'),
  'request' => array('template' => 'request.html', 'subject' => 'Подтверждающие документы'),
);

$result = array('success' => true);
$validateResult = validateForm($_GET);
if (!count($validateResult['errors'])) {
  $sendResult = sendMail($validateResult['data']);
  if (strlen($sendResult)) {
    $result = array(
      'success' => false,
      'errors' => array($sendResult)
    );
  }
  $email = $validateResult['data']['email'];
  $form = $_GET['form'];
  sendMailToClient($email, $back_email[$form]['subject'], $back_email[$form]['template']);
} else {
  $result = array(
    'success' => false,
    'errors' => $validateResult['errors']
  );
}
if ($result['success']) {
  $result['message'] = 'Ваше сообщение успешно отправлено';
}
header('Content-Type: application/json');
if (!$result['success']) header('HTTP/1.0 403 Forbidden');
echo json_encode($result);

function validateForm($fields) {
  global $fields_errors;
  global $forms;
  $data = array();
  $errors = array();
  if (isset($fields['form']) && isset($forms[$fields['form']])) {
    $form = $forms[$fields['form']];
    foreach ($form as $field) {
      if ($field == 'file') {
        $fields[$field] = $_FILES[0];
      }


      if (isset($fields[$field])) {
        $field_value = sanitizeField($fields[$field]);
        if ($field_value != '') {
          if (validateField($field, $field_value)) {
            $data[$field] = $field_value;
          } else {
            $errors[$field] = $fields_errors[$field];
          }
        }

      } else {
        $errors[] = 'Field ' . $field . ' not found';
      }
    }
  } else {
    $errors[] = 'Form name not found';
  }

  return array(
    'data' => $data,
    'errors' => $errors,
    'form' => $form,
  );
}

function sanitizeField($str) {
  return (gettype($str) == 'string') ?
    htmlspecialchars(strip_tags(trim($str))) :
    $str;
}

function validateField($field, $value) {
  $function_name = 'validate' . $field;
  return (is_callable($function_name)) ?
    call_user_func($function_name, $value)
    : false;
}

function validatename($e) {
  return strlen($e) >= 0;
}

function validatephone($e) {
  return preg_match('/^\+\d \(\d{3}\) \d{3}\-\d{2}\-\d{2}$/', $e);
}

function validateemail($e) {
//    return preg_match('/^[a-z0-9!#$%&\'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/', $e);
  return filter_var($e, FILTER_VALIDATE_EMAIL);
}

function validatenumber($e) {
  return strlen($e) >= 0;
}

function validatefile($e) {
  $file_parts = explode('.', $e['name']);
  $file_ext = $file_parts[count($file_parts) - 1];
  $allowed_filetypes = array('pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif');
  return $e['size'] < 10 * 1024 * 1024 && array_search($file_ext, $allowed_filetypes) !== false;
}

function sendMail($data) {
  require_once 'mailer/PHPMailerAutoload.php';
  global $email_from;
  global $email_from_name;
  global $email_to;
  global $forms_names;
  global $fields_names;

  $mail = new PHPMailer;
  $mail->CharSet = 'UTF-8';
  $mail->From = $email_from;
  $mail->FromName = $email_from_name;
  $mail->addAddress($email_to);

  if (isset($data['file'])) {
    $mail->addAttachment($data['file']['tmp_name'], $data['file']['name']);
  }

  $mail->Subject = 'Сообщение из формы "' . $forms_names[$_GET['form']] . '"';
  $body = '';
  foreach ($data as $field_name => $field_value) {
    $body .= '<b>' . $fields_names[$field_name] . ':</b> ' . $field_value . "<br>";
  }
  $mail->Body = $body;
  $mail->isHTML(true);

  return ($mail->send()) ?
    '' :
    'Error: ' . $mail->ErrorInfo;
}

function sendMailToClient($email_to, $subject, $template) {
  require_once 'mailer/PHPMailerAutoload.php';
  global $email_from;
  global $email_from_name;

  $mail = new PHPMailer;
  $mail->CharSet = 'UTF-8';
  $mail->From = $email_from;
  $mail->FromName = $email_from_name;
  $mail->addAddress($email_to);


  $mail->Subject = $subject;

  $mail->Body = file_get_contents('mail/' . $template);
  $mail->isHTML(true);

  return ($mail->send()) ?
    '' :
    'Error: ' . $mail->ErrorInfo;

}

