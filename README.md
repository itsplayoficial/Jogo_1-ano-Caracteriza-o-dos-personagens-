# Guarda-roupa dos Playzinhos — It's Play

Jogo para escolher roupas e acessórios de acordo com regras de escola, festa, frio, chuva, sol e esporte. Usa os quatro personagens enviados: Playzinho, Play Rosy, Enzo e Helena. O guarda-roupa muda conforme a missão e o personagem. Play Rosy e Helena têm vestidos, uniformes com saia ou calça e acessórios próprios.

## Abrir

Abra `index.html` em um navegador. Não é necessário instalar nada. As imagens e o código estão dentro desse arquivo, que também funciona sem internet.

## Publicar no GitHub Pages

1. Crie um repositório e envie os arquivos desta pasta para a raiz.
2. Abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Selecione a branch **main** e a pasta **/(root)**. Clique em **Save**.
5. Aguarde o endereço publicado e abra-o nos tablets.

## Ajustes dos personagens e da chuva

Olhos curvos reconstruídos a partir das referências 3D; Rosy e Helena têm cílios, Enzo tem sobrancelhas. Pescoço cilíndrico visível, cores, mãos e detalhes originais ajustados. As imagens 3D fornecidas aparecem nos botões de seleção. Os modelos do jogo são reconstruções geométricas das referências, e não modelos 3D originais fornecidos pela marca.

Na chuva, os meninos recebem quatro jaquetas retas impermeáveis. Playzinho usa calça; Enzo mantém sua roda única. Capas abertas e ponchos são exclusivos da Rosy e da Helena. O botão e o código de leitura em voz alta foram removidos.

## Novo guarda-roupa

O catálogo reúne 100 peças: 61 roupas, 17 itens para a cabeça e 22 acessórios. São 57 peças novas, com cortes e acabamentos diferentes, selecionadas conforme a missão e o personagem. O catálogo tem rolagem para manter o quarto visível.

- Escola: saia plissada, jardineira, colete, cardigã e bermuda de uniforme; mochilas e bolsa de ombro.
- Festa: vestidos de babados, flores, tule e baile; macacão, smoking, colete e suspensórios; coroas, tiaras, bolsas e colares.
- Frio: parka, casaco com fechos, suéter trançado e jaqueta de losangos; protetores de orelhas, luvas e cachecóis.
- Chuva: capas com bolsos ou listras, ponchos com nuvens ou bolinhas, chapéus impermeáveis e guarda-chuva colorido.
- Sol: vestidos xadrez ou floridos, jardineira, conjunto marinheiro e saia de pregas; chapéus, bonés e viseira.
- Esporte: futebol, basquete, tênis, corrida e agasalho; garrafas e cantil.

## Jogar

Escolha uma situação e um robô. Leia as duas regras. Vista uma peça por grupo: roupa, cabeça e acessório. Toque novamente para retirar uma peça. Clique em **Conferir minha escolha**.

Uma estrela indica que as duas regras foram cumpridas. A estrela de ouro indica que a criança usou o menor número de peças necessário. Cada uma das seis missões admite soluções com duas peças, e algumas têm mais de uma combinação válida. As regras são características dos itens, e não preferências sobre aparência ou gênero.

**Guardar foto** baixa uma imagem PNG do quarto e do personagem vestido no ângulo escolhido. O download pode ser tratado de maneira diferente por cada navegador móvel.

## Proposta pedagógica

Para crianças de aproximadamente 6 anos, explorar características, classificação, escolhas por regras, comparação entre soluções e economia de recursos. Os textos são curtos, os botões têm identificação e a interface se adapta a celular, tablet e computador.

Sugestões ao professor:

- Usar: experimentar uma missão e explicar por que uma peça atende à regra.
- Modificar: trocar uma peça e verificar se as regras continuam atendidas.
- Criar: inventar um visual e propor uma nova situação oralmente.
- Perguntar: “Você consegue resolver com menos peças?” e “Há outra combinação possível?”.

As regras simplificam cada situação para a atividade. Elas não representam uma lista completa de orientações de saúde, vestuário ou proteção climática.

## Visual e giro 3D

Versão 5.0: os quatro robôs, roupas e acessórios são malhas tridimensionais reais renderizadas com Three.js/WebGL. O giro revela volume em todos os lados. Cabeça, corpo, membros, antena, engrenagens e locomoção são modelados com base nas referências; Enzo mantém uma única roda. Os botões de seleção mostram as imagens originais.

As roupas são ajustadas às medidas de cada modelo, com cortes distintos: vestidos rodados, uniformes com saia ou calça, conjuntos esportivos, roupas de verão, casacos e capas de chuva. Tiara, laço, bolsinha, colar e brincos complementam os visuais da Play Rosy e da Helena. Mochila fica nas costas, garrafa junto à mão, óculos no rosto, gorro/boné na cabeça e cachecol no pescoço. A logo oficial está incorporada ao arquivo. O cenário é um quarto 3D com mobiliário, janela e iluminação.

Arraste horizontalmente o robô para girar ou use as setas, o controle de ângulo e o botão de volta completa. A foto registra o ângulo escolhido. Para exibir o 3D, o navegador precisa oferecer WebGL 2. Em navegadores sem suporte, aparece uma orientação para abrir o jogo em um navegador compatível.

O arquivo `index.html` contém o motor 3D compilado e todas as imagens; não depende de CDN. A licença MIT do Three.js acompanha o pacote em `THREE-LICENSE.txt`.

### Editar a cena 3D

O código está em `source/scene3d.js`. A interface e as regras estão em `index.html`. Para recompilar a cena, instale Node.js, execute `npm install` e depois `npm run build` na pasta do jogo. A publicação e o uso do jogo já pronto não precisam dessas etapas.

O prompt de direção criativa está em `Prompt_Quarto_Playzinhos_3D.txt`.

## Dados e funcionamento

Sem contas, cadastro, anúncios, serviços externos ou coleta de dados. As estrelas duram apenas a sessão: recarregar a página recomeça as missões. A preferência por movimento reduzido desativa as animações de celebração.

Os arquivos são estáticos e não precisam de servidor de aplicação, banco de dados ou etapa de compilação.

## Validação

Foram verificadas as combinações de uma peça por grupo para todas as missões, incluindo escolhas vazias, acertos, erros e quantidade mínima de peças. Todas as peças da versão 4 foram renderizadas nos personagens compatíveis. Foram renderizadas 308 combinações de personagem e peça. As 24 combinações de personagem e missão foram verificadas com acertos e escolhas de roupa inadequada. O giro, o carregamento 3D, a renderização dos itens nos quatro personagens, o download de foto e a ausência de corte horizontal em largura de celular também foram verificados em Chromium. O comportamento de download depende do navegador.

Personagens e identidade: It's Play. Desenvolvido para o projeto pedagógico de Mychelline Souto Cunha.

Validação da versão 5: catálogo de 100 itens, exclusão de capas e ponchos para os meninos na chuva, quatro alternativas de jaqueta, ausência do botão e do código de voz, 24 combinações de personagem e missão, giro, captura de foto e largura de celular.
