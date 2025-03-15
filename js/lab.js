function createLab() {

  // Fonction pour activer un système
  function activateSystem(systemId) {
    const system = document.getElementById(systemId);
    // Mettre à jour les états des systèmes
    const statusNodes = system.querySelectorAll('.system-status');
    statusNodes.forEach(function (node) {
      if (node.classList.contains('offline')) {
        node.classList.add('online');
        node.classList.remove('offline');
        node.textContent = "Active";
      } else {
        node.classList.add('offline');
        node.classList.remove('online');
        node.textContent = "InActive";
      }
    });
  }

  // Activer chaque système avec un délai
  setTimeout(function () {
    activateSystem('system1');
  }, 5000);

  setTimeout(function () {
    activateSystem('system2');
  }, 8000);

  setTimeout(function () {
    activateSystem('system3');
  }, 10000);

  const codeElement = document.getElementById('liveCode');
  const codeLines = [
    "section .text",
    "global _start",
    "",
    "_start:",
    "    xor rax, rax",
    "    mov rbx, 0x1234567812345678",
    "    mov rcx, 0x8765432187654321",
    "    mov rdx, 0x1111111111111111",
    "    add rbx, rcx",
    "    sub rbx, rdx",
    "    call chkfail",
    "    jmp $",
    "",
    "chkfail:",
    "    push rbp",
    "    mov rbp, rsp",
    "    mov rdi, 42",
    "    call printf",
    "    mov rsp, rbp",
    "    pop rbp",
    "    ret",
    "",
    "section .data",
    "    format db '%d', 0",
    "",
    "section .bss",
    "    buffer resb 64",
    "",
    "section .rodata",
    "    message db 'KEEP', 0",
    "",
    "section .bss",
    "    buffer resb 128",
    "",
    "section .text",
    "    mov eax, 1",
    "    xor ebx, ebx",
    "    int 0x80",
    "",
    "section .data",
    "    prioent db '92', 0",
    "    tcf dq 6402",
    "",
    "section .text",
    "    mov rsi, rax",
    "    cmp rsi, 0",
    "    jne not_equal",
    "    mov rdi, rdx",
    "    jmp end",
    "",
    "not_equal:",
    "    mov rdi, rbx",
    "",
    "end:",
    "    xor rax, rax",
    "    ret"
];

  // Fonction pour afficher une ligne de code après l'autre avec un délai

  function writeCode(index, letterIndex) {
    if (index < codeLines.length) {
      const line = codeLines[index];
      if (letterIndex < line.length) {
        codeElement.textContent += line.charAt(letterIndex);
        codeElement.parentNode.scrollTop = codeElement.scrollHeight;
        setTimeout(function () {
          writeCode(index, letterIndex + 1);
        }, 50); // Délai de 50ms entre chaque lettre
      } else {
        codeElement.textContent += "\n";
        writeCode(index + 1, 0); // Passer à la ligne suivante
      }
    }
  }


  // Commencer à écrire le code dès que la page est chargée
  writeCode(0, 0);

  // Initialising the canvas
  var canvas = document.getElementById('matrix'),
    ctx = canvas.getContext('2d');

  // Setting up the letters
  var letters = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789ÀàÁáÂâÃãÄäÅåÆæÇçÈèÉéÊêËëÌìÍíÎîÏïÐðÑñÒòÓóÔôÕõÖöØøŒœÙùÚúÛûÜüÝýÞþßĀāĂăĄąǍǎǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσςΤτΥυΦφΧχΨψΩωАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯяאבגדהוזחטיכךלמםנןסעפףצץקרשתءآأؤإئابةتثجحخدذرزسشصضطظعغـفقكلمنهوىيًٌٍَُِّْٰٹپچڈڑژکگںھہیے۰۱۲۳۴۵۶۷۸۹აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚸᚹᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛇᛈᛉᛊᛋᛌᛍᛎᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛠᛡᛢᛣᛤᛥᛦᛧᛨᛩᛪ᛫ᛮᛯᛰᛱᛲᛳᛴᛵᛶᛷᛸកខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវឝឞសហឡអឣឤឥឦឧឨឩឪឫឬឭឮឯឰឱឲឳ឴឵ាិីឹឺុូួើឿៀេែៃោៅⴀⴁⴂⴃⴄⴅⴆⴇⴈⴉⴊⴋⴌⴍⴎⴏⴐⴑⴒⴓⴔⴕⴖⴗⴘⴙⴚⴛⴜⴝⴞⴟⴠⴡⴢⴣⴤⴥⴧⴭⴰⴱⴲⴳⴴⴵⴶⴷⴸⴹⴺⴻⴼⴽⴾⴿⵀⵁⵂⵃⵄⵅⵆⵇⵈⵉⵊⵋⵌⵍⵎⵏⵐⵑⵒⵓⵔⵕⵖⵗⵘⵙⵚⵛⵜⵝⵞⵟⵠⵡⵢⵣⵤⵥⵦⵧ';
  letters = letters.split('');

  // Setting up the columns
  var fontSize = 5,
    columns = canvas.width / fontSize;

  // Setting up the drops
  var drops = [];
  for (var i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  // Setting up the draw function
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, .1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < drops.length; i++) {
      var text = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillStyle = '#aa0';
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      drops[i]++;
      if (drops[i] * fontSize > canvas.height && Math.random() > .95) {
        drops[i] = 0;
      }
    }
  }

  // Loop the animation
  setInterval(draw, 60);
}

