import { Sound, Category } from './types';

export const DEFAULT_SOUND: Sound = {
  name: 'Raining Sounds for Sleeping',
  url: 'https://soundcloud.com/relaxing-white-noise/raining-sounds-for-sleeping-featuring-rain-on-window-white-noise-no-thunder-75-minutes',
  duration: '75 min'
};

export const SOUND_CATEGORIES: Category[] = [
  {
    name: 'Chuva',
    sounds: [
      DEFAULT_SOUND,
      { name: 'Perfect Rain Sounds', url: 'https://soundcloud.com/relaxing-white-noise/perfect-rain-sounds-for-sleep', duration: '75 min' },
      { name: 'Forest Rain Sounds', url: 'https://soundcloud.com/relaxing-white-noise/forest-rain-sounds-for-sleeping-or-studying-75-minutes', duration: '75 min' },
      { name: 'Rain In The Woods', url: 'https://soundcloud.com/relaxing-white-noise/rain-in-the-woods-sleep-sound-5-hours', duration: '5 h' },
      { name: 'Thunder & Rain', url: 'https://soundcloud.com/relaxing-white-noise/epic-rain-and-thunder-5-hours', duration: '5 h' },
      { name: 'ASMR Rain on Car Roof', url: 'https://soundcloud.com/ampvil/asmr-rain-on-car-roof-1-hour', duration: '1 h'},
      { name: 'Rain on Car (30 minutes)', url: 'https://soundcloud.com/user-727114568/30-minutes-video-of-rain-on-car-relaxing-soothing-sounds-of-rain', duration: '30 min'}
    ]
  },
  {
    name: 'Oceano',
    sounds: [
      { name: 'Ocean Waves for Deep Sleep', url: 'https://soundcloud.com/relaxing-white-noise/ocean-waves-for-deep-sleep-studying-focus-75-minutes', duration: '75 min' },
      { name: 'Most Relaxing Ocean Waves', url: 'https://soundcloud.com/relaxing_guru/most-relaxing-ocean-waves-sounds-6-hours-sound-of-the-sea-to-fall-asleep-faster', duration: '6 h' },
      { name: 'Ocean Waves + Rain', url: 'https://soundcloud.com/relaxing-white-noise/ocean-waves-and-gentle-rain-75-minutes', duration: '75 min' }
    ]
  },
  {
    name: 'Natureza',
    sounds: [
      { name: 'Forest Night Sounds', url: 'https://soundcloud.com/relaxing-white-noise/forest-night-nature-sounds', duration: '75 min' },
      { name: 'Morning Birds in Nature Reserve', url: 'https://soundcloud.com/heinz-pichler-676677735/mornings-in-the-nature-conservancy-forest-birds-birds-birds-field-recording-nature', duration: '75 min' },
      { name: 'Wind In The Trees', url: 'https://soundcloud.com/relaxing-white-noise/wind-in-the-trees-white-noise-75-minutes', duration: '75 min' }
    ]
  },
  {
    name: 'Ruído',
    sounds: [
      { name: 'Sleep Sounds White Noise', url: 'https://soundcloud.com/relaxing-white-noise/sleep-sounds-white-noise-ambience', duration: '75 min' },
      { name: 'Pink Noise', url: 'https://soundcloud.com/relaxing-white-noise/pink-noise-75-minutes', duration: '75 min' },
      { name: 'Brown Noise 1950s Vinyl', url: 'https://soundcloud.com/neilbalfour/brown-noise-1-hour-1950s-vinyl', duration: '1 h' }
    ]
  },
  {
    name: 'Ventilador',
    sounds: [
      { name: 'Fan Sounds White Noise', url: 'https://soundcloud.com/relaxing-white-noise/fan-white-noise-5-hours', duration: '5 h' },
      { name: 'Box Fan White Noise', url: 'https://soundcloud.com/relaxing-white-noise/box-fan-white-noise', duration: '75 min' },
      { name: 'Oscillating Fan', url: 'https://soundcloud.com/relaxing-white-noise/oscillating-fan-white-noise', duration: '75 min' }
    ]
  },
  {
    name: 'Lareira',
    sounds: [
      { name: 'Fireplace with Crackling', url: 'https://soundcloud.com/relaxing-white-noise/fireplace-with-crackling', duration: '75 min' },
      { name: 'Winter Storm + Fireplace', url: 'https://soundcloud.com/relaxing-white-noise/relax-to-winter-storm-sounds-crackling-fireplace-comfy-vibe-75-minutes', duration: '75 min' }
    ]
  },
  {
    name: 'Piano',
    sounds: [
      { name: 'Relaxing Piano Music', url: 'https://soundcloud.com/soothingrelaxation/relaxing-piano-music-relaxing-music-sleep-music-meditation-music-spa-music-109', duration: '3 h' },
      { name: 'I\'ll Stay - Piano Music', url: 'https://soundcloud.com/soothingrelaxation/ill-stay-relaxing-piano-music-for-sleeping-studying-soothing-world', duration: '3 h' },
      { name: 'Forever - Beautiful Piano', url: 'https://soundcloud.com/soothingrelaxation/relaxing-piano-music-beautiful-relaxing-music-sleep-music-peaceful-music-romantic-music-145', duration: '3 h' }
    ]
  },
  {
    name: 'Meditação',
    sounds: [
      { name: 'Bamboo Water Fountain + Tibetan Bowls', url: 'https://soundcloud.com/relaxing-white-noise/bamboo-water-fountain-tibetan', duration: '75 min' },
      { name: '432Hz Tibetan Singing Bowls', url: 'https://soundcloud.com/brucecohn/432hz-tibetan-singing-bowls-for-deep-sleep-healing-and-relaxation', duration: '1 h' },
      { name: 'Tibetan Bowls + Rain + Ocean', url: 'https://soundcloud.com/relaxing-white-noise/tibetan-singing-bowls-music-to-sleep-with-rain-sounds-and-ocean-waves-in-hawaii-75-minutes', duration: '75 min' }
    ]
  },
  {
    name: 'Foco',
    sounds: [
      { name: 'Good Morning Meditation', url: 'https://soundcloud.com/sonic-yogi/good-morning', duration: '30 min' },
      { name: 'Summer Night Meditation', url: 'https://soundcloud.com/sonic-yogi/summernightmeditation', duration: '30 min' },
      { name: 'Super Intelligence Focus Music', url: 'https://soundcloud.com/spiritualmoment/super-inteligencia-1-hora', duration: '1 h' }
    ]
  },
  {
    name: 'Lofi',
    sounds: [
      { name: 'Lofi Sleep Mix', url: 'https://soundcloud.com/yawn-label/lofi-sleep-mix-lofi-sleep-relax-meditation', duration: '1 h' },
      { name: '1 Hour Chill Aesthetic Lofi', url: 'https://soundcloud.com/lofi_and_chill/1-hour-chill-aesthetic-lofi-mix-for-sleeping-chillhop-jazzhop', duration: '1 h' }
    ]
  },
  {
    name: 'Ambiente',
    sounds: [
      { name: '1 Hour Relaxing Lounge Chillout', url: 'https://soundcloud.com/fm_freemusic/1-hour-relaxing-lounge-chillout-background-music-ambient-calm-cinematic-music-by-oleg-mazur', duration: '1 h' },
      { name: 'Essential Ambient Mix', url: 'https://soundcloud.com/ambientmusicalgenre/essential-ambient-mix', duration: '2 h' },
      { name: '3 Hours Balearic Summer Time', url: 'https://soundcloud.com/eyad-shebli/3-hours-relaxing-music-ambient', duration: '3 h' }
    ]
  },
  {
    name: 'Café',
    sounds: [
      { name: 'Café Leblanc Ambience', url: 'https://soundcloud.com/grant-lewers-185714392/cafe-leblanc-coffee-shop-ambience-smooth-jazz-persona-music-rain-to-study-relax-sleep', duration: '1 h' }
    ]
  }
];