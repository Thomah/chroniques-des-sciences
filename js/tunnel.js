
// Fonction pour initialiser le tunnel
function initTunnel(state) {
  const tunnel = document.getElementById(state.args);
  const numberOfCircles = 30; // Nombre de cercles pour l'effet de profondeur

  // Création dynamique des cercles
  for (let i = 0; i < numberOfCircles; i++) {
    const circle = document.createElement('div');
    circle.classList.add('circle');

    // Calculer la taille et le décalage d'animation pour chaque cercle
    const size = 50 + i * 15; // Taille augmentée par 15px pour chaque cercle
    const delay = i * 0.1;   // Décalage d'animation pour chaque cercle

    // Appliquer les styles calculés
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.animationDelay = `${delay}s`;

    // Ajouter le cercle au conteneur
    tunnel.appendChild(circle);
  }
}