/* ==========================================================================
   THE CLOSET — scripts do site
   Dependências (carregadas com defer via CDN em cada página):
     - jQuery 3.7.1          (biblioteca)
     - Slick Carousel 1.8.1  (plugin 1: carousel do banner e de destaques)
     - jQuery Mask 1.14.16   (plugin 2: máscaras de CPF, telefone e CEP)
   Funcionalidades próprias: menu responsivo, accordion, lightbox da galeria,
   filtro/ordenação da vitrine, carrinho com itens e contador, validação do formulário,
   botão voltar ao topo.
   ========================================================================== */

$(function () {
  "use strict";

  /* ---------- Funções utilitárias ---------- */

  // Converte "R$ 199,90" ou data-preco="199.90" em número
  function paraNumero(valor) {
    return parseFloat(String(valor).replace(/[^\d,.-]/g, "").replace(",", ".")) || 0;
  }

  // Mantém os produtos escolhidos no localStorage para compartilhar entre páginas.
  function lerCarrinho() {
    try {
      var dados = localStorage.getItem("thecloset-carrinho-itens");
      var itens = dados ? JSON.parse(dados) : [];
      if (!Array.isArray(itens)) { throw new Error("Formato de carrinho inválido."); }
      return itens.filter(function (item) {
        return item && typeof item.nome === "string" &&
          Number.isFinite(Number(item.preco)) &&
          typeof item.imagem === "string" && /^img\/[\w-]+\.svg$/.test(item.imagem);
      });
    } catch (e) {
      console.error("Não foi possível ler os itens do carrinho.", e);
      return [];
    }
  }
  function gravarCarrinho(itens) {
    try {
      localStorage.setItem("thecloset-carrinho-itens", JSON.stringify(itens));
      return true;
    } catch (e) {
      console.error("Não foi possível salvar os itens do carrinho.", e);
      return false;
    }
  }
  function atualizarContador(itens) {
    $(".carrinho__contador").text(itens.length);
  }
  function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
  }
  function renderizarCarrinho(itens) {
    var $lista = $("#itens-carrinho");
    if (!$lista.length) { return; }

    $lista.empty();
    var total = 0;
    itens.forEach(function (item, indice) {
      var preco = Number(item.preco);
      total += preco;
      var $linha = $("<li>").addClass("item-carrinho");
      $("<img>").attr({ src: item.imagem, alt: "" }).appendTo($linha);
      var $detalhes = $("<div>").addClass("item-carrinho__detalhes").appendTo($linha);
      $("<h3>").text(item.nome).appendTo($detalhes);
      $("<p>").text(formatarPreco(preco)).appendTo($detalhes);
      $("<button>").attr({
        type: "button",
        "data-indice": indice,
        "aria-label": "Remover " + item.nome
      })
        .addClass("item-carrinho__remover").text("Remover")
        .appendTo($linha);
      $lista.append($linha);
    });

    $("#subtotal-carrinho").text(formatarPreco(total));
    $("#carrinho-vazio").prop("hidden", itens.length > 0);
    $("#resumo-carrinho").prop("hidden", itens.length === 0);
    $("#finalizar-compra").prop("disabled", itens.length === 0);
  }

  // Marca campo como válido/inválido e mostra mensagem
  function marcarCampo($campo, valido, mensagem) {
    var $wrap = $campo.closest(".campo");
    $wrap.toggleClass("erro", !valido).toggleClass("ok", valido);
    $wrap.find(".mensagem-erro").text(valido ? "" : mensagem);
    $campo.attr("aria-invalid", !valido);
    return valido;
  }

  /* ---------- Menu responsivo (evento click) ---------- */
  var $toggle = $(".menu-toggle");
  var $menu = $("#menu-principal");

  $toggle.on("click", function () {
    var aberto = $(this).attr("aria-expanded") === "true";
    $(this).attr("aria-expanded", !aberto);
    $menu.toggleClass("aberto", !aberto);
  });

  // fecha o menu ao escolher um link (celular)
  $menu.on("click", "a", function () {
    $toggle.attr("aria-expanded", "false");
    $menu.removeClass("aberto");
  });

  /* ---------- Plugin 1: Slick Carousel ---------- */
  if ($.fn.slick) {
    $(".hero__slides").slick({
      dots: true,
      arrows: true,
      autoplay: true,
      autoplaySpeed: 5000,
      fade: true,
      adaptiveHeight: false
    });

    $(".carousel-produtos").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: true,
      arrows: false,
      mobileFirst: true,          // breakpoints no mesmo espírito mobile-first
      responsive: [
        { breakpoint: 575, settings: { slidesToShow: 2 } },
        { breakpoint: 831, settings: { slidesToShow: 3, arrows: true } },
        { breakpoint: 1151, settings: { slidesToShow: 4, arrows: true } }
      ]
    });
  }

  /* ---------- Plugin 2: jQuery Mask ---------- */
  if ($.fn.mask) {
    $("#cpf, #cpf-checkout").mask("000.000.000-00");
    $("#telefone").mask("(00) 00000-0000");
    $("#cep, #cep-checkout").mask("00000-000");
  }

  /* ---------- Carrinho (click + animação) ---------- */
  var itensCarrinho = lerCarrinho();
  atualizarContador(itensCarrinho);
  renderizarCarrinho(itensCarrinho);

  $(document).on("click", ".adicionar-carrinho", function () {
    var $produto = $(this).closest(".produto");
    var $imagem = $produto.find(".produto__imagem img");
    itensCarrinho.push({
      nome: $produto.find(".produto__info h3").text().trim(),
      preco: Number($produto.data("preco")),
      imagem: $imagem.attr("src")
    });
    if (!gravarCarrinho(itensCarrinho)) {
      window.alert("Não foi possível salvar o carrinho neste navegador.");
      itensCarrinho.pop();
      return;
    }
    atualizarContador(itensCarrinho);
    renderizarCarrinho(itensCarrinho);
    var $contador = $(".carrinho__contador");
    $contador.removeClass("pulsar");
    // força reflow para reiniciar a animação
    void $contador[0].offsetWidth;
    $contador.addClass("pulsar");
    $(this).text("Adicionado ✓");
  });

  $("#itens-carrinho").on("click", ".item-carrinho__remover", function () {
    var indice = Number($(this).attr("data-indice"));
    var removido = itensCarrinho.splice(indice, 1);
    if (!gravarCarrinho(itensCarrinho)) {
      itensCarrinho.splice(indice, 0, removido[0]);
      return;
    }
    atualizarContador(itensCarrinho);
    renderizarCarrinho(itensCarrinho);
  });

  $(".metodo-pagamento input").on("change", function () {
    var metodo = $(this).val();
    $(".pagamento-detalhe").prop("hidden", true);
    $('.pagamento-detalhe[data-metodo="' + metodo + '"]').prop("hidden", false);
    $("#codigo-cupom").prop("required", metodo === "cupom").val("").trigger("input");
  });

  /* ---------- Vitrine: filtro e ordenação (evento change) ---------- */
  $("#filtro-categoria").on("change", function () {
    var valor = $(this).val();
    $(".vitrine .produto").each(function () {
      var mostrar = valor === "todos" || $(this).data("categoria") === valor;
      $(this).toggleClass("oculto", !mostrar);
    });
  });

  $("#ordenar").on("change", function () {
    var criterio = $(this).val();
    var $vitrine = $(".vitrine");
    var itens = $vitrine.children(".produto").get();

    itens.sort(function (a, b) {
      var pa = paraNumero($(a).data("preco"));
      var pb = paraNumero($(b).data("preco"));
      if (criterio === "menor") { return pa - pb; }
      if (criterio === "maior") { return pb - pa; }
      return $(a).index() - $(b).index();
    });
    $vitrine.append(itens);
  });

  /* ---------- Destaque ao passar o mouse (mouseover/mouseout) ---------- */
  $(".produto").on("mouseover", function () {
    $(this).find(".selo").stop(true).fadeTo(200, 0.6);
  }).on("mouseout", function () {
    $(this).find(".selo").stop(true).fadeTo(200, 1);
  });

  /* ---------- Accordion (FAQ / notas olfativas) ---------- */
  $(".accordion__botao").on("click", function () {
    var $botao = $(this);
    var aberto = $botao.attr("aria-expanded") === "true";
    var $painel = $("#" + $botao.attr("aria-controls"));

    // fecha os outros itens do mesmo accordion
    $botao.closest(".accordion").find(".accordion__botao").not($botao)
      .attr("aria-expanded", "false")
      .each(function () { $("#" + $(this).attr("aria-controls")).slideUp(250); });

    $botao.attr("aria-expanded", !aberto);
    $painel.stop(true).slideToggle(250);
  });

  /* ---------- Lightbox da galeria ---------- */
  var $lightbox = $(".lightbox");

  $(".galeria").on("click", "a", function (evento) {
    evento.preventDefault();
    var $img = $(this).find("img");
    $lightbox.find("img").attr({ src: $(this).attr("href"), alt: $img.attr("alt") });
    $lightbox.addClass("ativo").attr("aria-hidden", "false");
    $lightbox.find(".lightbox__fechar").trigger("focus");
  });

  function fecharLightbox() {
    $lightbox.removeClass("ativo").attr("aria-hidden", "true");
  }
  $lightbox.on("click", function (evento) {
    if (evento.target === this || $(evento.target).is(".lightbox__fechar")) { fecharLightbox(); }
  });
  $(document).on("keydown", function (evento) {
    if (evento.key === "Escape") { fecharLightbox(); }
  });

  /* ---------- Validação do formulário (blur, focus, change, submit) ---------- */
  var regras = {
    nome: function (v) { return v.trim().length >= 3 || "Informe seu nome completo."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Informe um e-mail válido."; },
    telefone: function (v) { return v.replace(/\D/g, "").length >= 10 || "Informe um telefone com DDD."; },
    cpf: function (v) { return v === "" || validarCPF(v) || "CPF inválido."; },
    assunto: function (v) { return v !== "" || "Escolha um assunto."; },
    data: function (v) {
      if (v === "") { return true; }
      return new Date(v + "T00:00") >= new Date(new Date().toDateString()) || "Escolha uma data a partir de hoje.";
    },
    mensagem: function (v) { return v.trim().length >= 10 || "Escreva ao menos 10 caracteres."; }
  };

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) { return false; }
    for (var t = 9; t < 11; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) { soma += cpf[i] * (t + 1 - i); }
      var digito = ((soma * 10) % 11) % 10;
      if (parseInt(cpf[t], 10) !== digito) { return false; }
    }
    return true;
  }

  $("#cpf-checkout, #codigo-cupom").on("input", function () {
    this.setCustomValidity("");
    $("#confirmacao-checkout").prop("hidden", true).hide();
  });

  $("#form-checkout").on("submit", function (evento) {
    evento.preventDefault();
    var $cpf = $("#cpf-checkout");
    if (!validarCPF($cpf.val())) {
      $cpf[0].setCustomValidity("Informe um CPF válido.");
      $cpf[0].reportValidity();
      return;
    }
    $cpf[0].setCustomValidity("");
    var metodo = $("input[name='metodo-pagamento']:checked").val();
    var $cupom = $("#codigo-cupom");
    if (metodo === "cupom" && !$cupom.val().trim()) {
      $cupom[0].setCustomValidity("Informe o código do cupom.");
      $cupom[0].reportValidity();
      return;
    }
    $cupom[0].setCustomValidity("");
    $("#confirmacao-checkout").prop("hidden", false).slideDown(300);
  });

  function validarCampo($campo) {
    var regra = regras[$campo.attr("name")];
    if (!regra) { return true; }
    var resultado = regra($campo.val());
    return marcarCampo($campo, resultado === true, resultado);
  }

  var $form = $("#form-contato");

  $form.find("input, select, textarea")
    .on("focus", function () { $(this).closest(".campo").removeClass("erro"); })
    .on("blur change", function () { validarCampo($(this)); });

  // contador de caracteres da mensagem
  $("#mensagem").on("input", function () {
    $("#contador-mensagem").text($(this).val().length + "/500");
  });

  $form.on("submit", function (evento) {
    evento.preventDefault();
    var tudoValido = true;
    $form.find("input, select, textarea").each(function () {
      if (!validarCampo($(this))) { tudoValido = false; }
    });

    var $aceite = $("#aceite");
    if (!$aceite.is(":checked")) {
      marcarCampo($aceite, false, "É preciso aceitar a política de privacidade.");
      tudoValido = false;
    } else {
      marcarCampo($aceite, true, "");
    }

    if (tudoValido) {
      $(".alerta-sucesso").slideDown(300);
      $form[0].reset();
      $form.find(".campo").removeClass("ok");
    } else {
      $form.find(".campo.erro").first().find("input, select, textarea").trigger("focus");
    }
  });

  /* ---------- Newsletter ---------- */
  $(".newsletter form").on("submit", function (evento) {
    evento.preventDefault();
    var email = $(this).find("input").val();
    var valido = regras.email(email) === true;
    $(this).find("button").text(valido ? "Inscrito ✓" : "E-mail inválido");
  });

  /* ---------- Voltar ao topo (scroll + click) ---------- */
  var $voltar = $(".voltar-topo");
  $(window).on("scroll", function () {
    $voltar.toggleClass("visivel", $(this).scrollTop() > 400);
  });
  $voltar.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });

  /* ---------- Ano atual no rodapé ---------- */
  $(".ano-atual").text(new Date().getFullYear());
});
