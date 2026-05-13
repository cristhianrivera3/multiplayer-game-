# 🚀 SPACE ALIENS - Pixel Arcade Shooter

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/cristhianrivera3/multiplayer-game-)](https://github.com/cristhianrivera3/multiplayer-game-/commits/main)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/es/docs/Web/JavaScript)

Un juego arcade 2D estilo **pixel art** donde controlas una nave espacial y derribas alienígenas. Desarrollado completamente con HTML5 Canvas, CSS3 y JavaScript vanilla.

![Gameplay](screenshot.png)

## ✨ Características

### 🎮 Jugabilidad
- ✅ **Movimiento suave** de la nave con el mouse
- ✅ **Disparo automático** manteniendo clic
- ✅ **Sistema de vidas** con invencibilidad temporal
- ✅ **Puntuación y récord local** (guardado en localStorage)
- ✅ **Sistema de Waves** (dificultad progresiva)

### 👾 Enemigos
- 🟣 **Alien Normal** - Velocidad media, 1 vida
- 🟠 **Alien Rápido** - Alta velocidad, 1 vida
- 🟢 **Alien Tanque** - Lento, 3 vidas

### 🛸 Naves seleccionables
| Nave | Velocidad | Cadencia | Vidas |
|------|-----------|----------|-------|
| ⭐ Clásica | Normal | Normal | 3 |
| ⚡ Rápida | +30% | +30% | 3 |
| 🛡️ Tanque | -20% | -30% | 5 |

### 🌍 Mapas disponibles
- 🔮 **Nebulosa Morada** - Dificultad normal
- 🔥 **Planeta Volcán** - Dificultad difícil
- ❄️ **Tundra Helada** - Dificultad fácil

### 💥 Power-ups
- 🔫 **Disparo Triple** - Dispara 3 proyectiles por 5 segundos
- 🛡️ **Escudo** - Inmunidad por 5 segundos

### 🎨 Efectos visuales
- Explosiones con partículas
- Texto flotante "¡GOLPE!"
- Pantalla roja al recibir daño
- Efecto de parpadeo de la nave
- Estrellas de fondo dinámicas

### 🔊 Sonido
- Efecto de disparo (sintetizado con Web Audio API)
- Efecto de explosión

## 🎯 Controles

| Acción | Control |
|--------|---------|
| Mover nave | 🖱️ Mouse |
| Disparar | 🔫 Clic izquierdo |
| Disparo automático | Mantener clic |
| Pausa | ⎚ Tecla ESC |

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/cristhianrivera3/multiplayer-game-.git

# Entrar en la carpeta
cd multiplayer-game-

# Abrir el juego (cualquier navegador moderno)
open index.html
🎮 Cómo jugar
Selecciona tu nave favorita

Elige tu mapa preferido

Haz clic en COMENZAR JUEGO

Mueve el mouse para controlar la nave

Dispara a los aliens rojos/cafés/verdes

Cada alien destruido = +10-30 puntos

Sobrevive waves completas para aumentar dificultad

¡No dejes que los aliens lleguen abajo!

🏆 Sistema de puntuación
Enemigo	Puntos
Alien Normal	10
Alien Rápido	15
Alien Tanque	30
🛠️ Tecnologías utilizadas
HTML5 Canvas - Renderizado del juego

CSS3 - Estilos pixel art y diseño responsive

JavaScript (ES6+) - Lógica del juego

Web Audio API - Efectos de sonido

LocalStorage - Guardado de récord

📁 Estructura del proyecto
text
multiplayer-game/
├── index.html      # Estructura principal
├── style.css       # Estilos pixel art
├── game.js         # Lógica del juego
├── README.md       # Documentación
└── screenshot.png  # Captura de pantalla
🚀 Próximas mejoras planificadas
Jefe final cada 5 waves

Más tipos de power-ups

Efectos de sonido adicionales

Modo multijugador local

Tabla de récords global

📸 Capturas de pantalla
(Agrega aquí una imagen del juego en acción)

👨‍💻 Autor
Cristhian Rivera

GitHub: @cristhianrivera3

Portfolio: cristhianrivera3.github.io

📄 Licencia
Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.