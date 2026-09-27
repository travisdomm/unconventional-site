/* ==========================================================================
   BRAND WALL — the logos in the scrolling strip under the hero.

   Only entries with status: "confirmed" are ever shown, and a brand is only
   marked confirmed after the owner has approved showing it AND its logo file
   is in assets/brands/ (white-on-transparent PNG or single-colour SVG; the
   CSS renders every mark white so the strip reads as one set).

   The order is deliberate: wordmarks and emblems alternate, related names
   (two car makers, two festivals...) are kept apart, and the first bar opens
   with the top of this list while the second bar plays it in reverse, so the
   bottom of the list opens the second bar. After a change, run
   bash tools/sync-brand-names.sh (it copies the names into the home page).

   This file is public. Keep candidate lists and notes in brand/brands.md
   (private), never here.
   ========================================================================== */

window.BRANDS = [
  { name: "Netflix",                                  logo: "assets/brands/netflix.png",                 status: "confirmed" },
  { name: "Apple",                                    logo: "assets/brands/apple.png",                   status: "confirmed" },
  { name: "Coca-Cola",                                logo: "assets/brands/coca-cola.png",               status: "confirmed" },
  { name: "Disney",                                   logo: "assets/brands/disney.png",                  status: "confirmed" },
  { name: "Louis Vuitton",                            logo: "assets/brands/louis-vuitton.png",           status: "confirmed" },
  { name: "Microsoft",                                logo: "assets/brands/microsoft.png",               status: "confirmed" },
  { name: "Nike",                                     logo: "assets/brands/nike.png",                    status: "confirmed" },
  { name: "Shedd Aquarium",                           logo: "assets/brands/shedd-aquarium.png",          status: "confirmed" },
  { name: "Metallica",                                logo: "assets/brands/metallica.png",               status: "confirmed" },
  { name: "Samsung",                                  logo: "assets/brands/samsung.png",                 status: "confirmed" },
  { name: "EA",                                       logo: "assets/brands/ea.png",                      status: "confirmed" },
  { name: "Beck",                                     logo: "assets/brands/beck.png",                    status: "confirmed" },
  { name: "City of Chicago",                          logo: "assets/brands/city-of-chicago.png",         status: "confirmed" },
  { name: "Cloudera",                                 logo: "assets/brands/cloudera.png",                status: "confirmed" },
  { name: "JELD-WEN",                                 logo: "assets/brands/jeld-wen.png",                status: "confirmed" },
  { name: "Riot Games",                               logo: "assets/brands/riot-games.png",              status: "confirmed" },
  { name: "Kennedy Space Center",                     logo: "assets/brands/kennedy-space-center.png",    status: "confirmed" },
  { name: "Marshmello",                               logo: "assets/brands/marshmello.png",              status: "confirmed" },
  { name: "Cisco",                                    logo: "assets/brands/cisco.png",                   status: "confirmed" },
  { name: "Formula E",                                logo: "assets/brands/formula-e.png",               status: "confirmed" },
  { name: "Art Institute of Chicago",                 logo: "assets/brands/art-institute-chicago.png",   status: "confirmed" },
  { name: "Bud Light",                                logo: "assets/brands/bud-light.png",               status: "confirmed" },
  { name: "Eddie Izzard",                             logo: "assets/brands/eddie-izzard.png",            status: "confirmed" },
  { name: "League of Legends",                        logo: "assets/brands/league-of-legends.png",       status: "confirmed" },
  { name: "Subaru",                                   logo: "assets/brands/subaru.png",                  status: "confirmed" },
  { name: "ServiceNow",                               logo: "assets/brands/servicenow.svg",              status: "confirmed" },
  { name: "Frederik Meijer Gardens & Sculpture Park", logo: "assets/brands/meijer-gardens.png",          status: "confirmed" },
  { name: "Iron Maiden",                              logo: "assets/brands/iron-maiden.png",             status: "confirmed" },
  { name: "Blizzard Entertainment",                   logo: "assets/brands/blizzard.png",                status: "confirmed" },
  { name: "Mana",                                     logo: "assets/brands/mana.png",                    status: "confirmed" },
  { name: "Computer History Museum",                  logo: "assets/brands/computer-history-museum.png", status: "confirmed" },
  { name: "Virgin Galactic",                          logo: "assets/brands/virgin-galactic.png",         status: "confirmed" },
  { name: "Akamai",                                   logo: "assets/brands/akamai.png",                  status: "confirmed" },
  { name: "Nissan",                                   logo: "assets/brands/nissan.png",                  status: "confirmed" },
  { name: "Stranger Things",                          logo: "assets/brands/stranger-things.png",         status: "confirmed" },
  { name: "John Fogerty",                             logo: "assets/brands/john-fogerty.png",            status: "confirmed" },
  { name: "CRSSD Festival",                           logo: "assets/brands/crssd.png",                   status: "confirmed" },
  { name: "Gaylord Hotels",                           logo: "assets/brands/gaylord-hotels.png",          status: "confirmed" },
  { name: "Coachella",                                logo: "assets/brands/coachella.svg",               status: "confirmed" },
  { name: "Museum of Science and Industry, Chicago",  logo: "assets/brands/msi-chicago.png",             status: "confirmed" },
  { name: "OVO",                                      logo: "assets/brands/ovo.png",                     status: "confirmed" },
  { name: "Descanso Gardens",                         logo: "assets/brands/descanso-gardens.png",        status: "confirmed" },
  { name: "Hublot",                                   logo: "assets/brands/hublot.png",                  status: "confirmed" },
  { name: "INFINITI",                                 logo: "assets/brands/infiniti.png",                status: "confirmed" },
  { name: "PHP",                                      logo: "assets/brands/php.png",                     status: "confirmed" },
  { name: "Epic Games",                               logo: "assets/brands/epic-games.png",              status: "confirmed" },
  { name: "Goldenvoice",                              logo: "assets/brands/goldenvoice.png",             status: "confirmed" },
  { name: "Zimmer Biomet",                            logo: "assets/brands/zimmer-biomet.png",           status: "confirmed" },
  { name: "The Morton Arboretum",                     logo: "assets/brands/morton-arboretum.png",        status: "confirmed" },
  { name: "The Chainsmokers",                         logo: "assets/brands/chainsmokers.png",            status: "confirmed" },
  { name: "City of Beverly Hills",                    logo: "assets/brands/beverly-hills.png",           status: "confirmed" },
  { name: "FX Networks",                              logo: "assets/brands/fx.png",                      status: "confirmed" },
  { name: "Semmel Exhibitions",                       logo: "assets/brands/semmel-exhibitions.png",      status: "confirmed" },
  { name: "H.E.R.",                                   logo: "assets/brands/her.png",                     status: "confirmed" },
  { name: "Yale Peabody Museum",                      logo: "assets/brands/yale-peabody-museum.png",     status: "confirmed" },
  { name: "Governors Ball",                           logo: "assets/brands/governors-ball.webp",         status: "confirmed" },
  { name: "Nu Skin",                                  logo: "assets/brands/nu-skin.png",                 status: "confirmed" },
  { name: "HP",                                       logo: "assets/brands/hp.png",                      status: "confirmed" },
  { name: "Karol G",                                  logo: "assets/brands/karol-g.png",                 status: "confirmed" },
  { name: "Volkswagen",                               logo: "assets/brands/volkswagen.png",              status: "confirmed" },
  { name: "Universal",                                logo: "assets/brands/universal.png",               status: "confirmed" },
  { name: "FIFA",                                     logo: "assets/brands/fifa.svg",                    status: "confirmed" },
  { name: "Hans Zimmer Live",                         logo: "assets/brands/hans-zimmer-live.png",        status: "confirmed" },
  { name: "YouTube",                                  logo: "assets/brands/youtube.png",                 status: "confirmed" },
  { name: "Hyundai",                                  logo: "assets/brands/hyundai.png",                 status: "confirmed" },
  { name: "U2",                                       logo: "assets/brands/u2.png",                      status: "confirmed" },
  { name: "McDonald's",                               logo: "assets/brands/mcdonalds.png",               status: "confirmed" },
  { name: "Nintendo",                                 logo: "assets/brands/nintendo.png",                status: "confirmed" }
];
