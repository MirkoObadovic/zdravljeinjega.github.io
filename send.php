<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  exit("Method not allowed");
}

function clean($v) {
  return trim(strip_tags($v ?? ""));
}

$ime = clean($_POST["ime"] ?? "");
$prezime = clean($_POST["prezime"] ?? "");
$trajanje = clean($_POST["trajanje"] ?? "");
$datum = clean($_POST["datum"] ?? "");
$telefon = clean($_POST["telefon"] ?? "");
$email = clean($_POST["email"] ?? "");

if (!$ime || !$prezime || !$trajanje || !$datum || !$telefon || !$email) {
  http_response_code(400);
  exit("Nedostaju podaci.");
}

$to = "zdravljenjega@gmail.com"; // tvoj email
$subject = "Nova prijava za čuvanje - $ime $prezime";

$message =
"Ime: $ime\n".
"Prezime: $prezime\n".
"Trajanje: $trajanje\n".
"Datum: $datum\n".
"Telefon: $telefon\n".
"Email: $email\n";

$headers = "From: noreply@tvojdomen.me\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($to, $subject, $message, $headers)) {
  header("Location: index.html#prijava");
  exit();
} else {
  http_response_code(500);
  exit("Neuspjelo slanje email-a.");
}