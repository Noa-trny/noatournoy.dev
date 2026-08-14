import type { Locale } from "./routes";

// Le contenu de l'accueil, extrait mecaniquement des deux anciens index.html.
// La structure (4 reperes, 6 jalons, 6 groupes de pile, 4 certifications) est
// identique dans les deux langues ; seul le texte change. Les titres de section
// gardent leur <em>, qui porte le vert acide — ils sont donc rendus tels quels.

type BrefRow = {
  readonly i: string;
  readonly k: string;
  readonly v: string;
  readonly n: string;
  readonly href: string | null;
};

type Milestone = {
  readonly when: string;
  readonly what: string;
  readonly where: string;
  readonly note: string;
  /** Le jalon en cours, mis en avant par spec.css. */
  readonly now: boolean;
};

/** Un segment d'accroche : `b` marque ce qui etait dans un <b>. */
type Seg = { readonly t: string; readonly b: boolean };

type StackItem = { readonly icon: string | null; readonly name: string };
type StackGroup = {
  readonly word: string;
  readonly plain: boolean;
  readonly items: readonly StackItem[];
};

type EmTitle = {
  readonly before: string;
  readonly em: string;
  readonly after: string;
};

type Cert = {
  readonly org: string;
  readonly name: string;
  readonly note: string;
  readonly when: string;
};

type HomeCopy = {
  /**
   * Le titre principal, en trois morceaux : le nom, le metier, puis la fin
   * mise en avant. Il est ICI et non dans le composant parce qu'il etait
   * ecrit en dur, en français, et rendu tel quel sur la page anglaise — dans
   * un `<html lang="en">`, sous le premier element qu'un lecteur d'ecran
   * annonce et que les moteurs indexent. Tout le reste de la page passait par
   * `content/` ; seul lui y echappait, donc le controle de parite ne pouvait
   * pas le voir.
   */
  readonly heroTitre: readonly [string, string, string];
  readonly heroSub: readonly Seg[];
  readonly heroCta: string;
  readonly heroCardLabel: string;
  readonly heroCardAlt: string;
  readonly mailLabel: string;
  readonly moreWork: string;
  readonly moreSkills: string;
  readonly contactLabel: string;
  /** Coupe par un <br> dans la maquette. */
  readonly contactTitle: readonly string[];
  readonly labels: Readonly<Record<"bref" | "travaux" | "parcours" | "stack" | "certs", string>>;
  /** Decoupes autour du <em> qui porte le vert acide : le site n'utilise
   *  innerHTML nulle part, et un composant JSX est aussi lisible. */
  readonly titles: Readonly<Record<"apropos" | "travaux" | "parcours" | "stack" | "certs", EmTitle>>;
  readonly bref: readonly BrefRow[];
  readonly time: readonly Milestone[];
  readonly stack: readonly StackGroup[];
  readonly certs: readonly Cert[];
};

export const home: Readonly<Record<Locale, HomeCopy>> = {
  "fr": {
    "heroTitre": ["Noa Tournoy,", "développeur full-stack", "& systèmes"],
    "heroSub": [
      {
        "t": "Étudiant ingénieur à Lille, spécialisé en ",
        "b": false
      },
      {
        "t": "cybersécurité",
        "b": true
      },
      {
        "t": ". Je développe en ",
        "b": false
      },
      {
        "t": "Python",
        "b": true
      },
      {
        "t": ", ",
        "b": false
      },
      {
        "t": "TypeScript",
        "b": true
      },
      {
        "t": " et ",
        "b": false
      },
      {
        "t": "Docker",
        "b": true
      },
      {
        "t": ", du tableau de bord de sécurité à l'expérience web 3D. Alternance chez ",
        "b": false
      },
      {
        "t": "ADEO",
        "b": true
      },
      {
        "t": " à partir d'octobre 2026.",
        "b": false
      }
    ],
    "heroCta": "Voir mes travaux",
    "heroCardLabel": "Éclosion · expérience web 3D, 100 % procédurale",
    "heroCardAlt": "L'aube d'Éclosion : le soleil affleure l'horizon au-dessus d'un relief procédural.",
    "mailLabel": "Écrire un courriel",
    "bref": [
      {
        "i": "_01",
        "k": "Maintenant",
        "v": "Cycle ingénieur",
        "n": "SUPINFO, 2024 → 2029",
        "href": null
      },
      {
        "i": "_02",
        "k": "Octobre 2026",
        "v": "Alternance cybersécurité",
        "n": "ADEO, Ronchin",
        "href": null
      },
      {
        "i": "_03",
        "k": "Certifications",
        "v": "Quatre titres",
        "n": "Looker · LookML · AWS · CCNA",
        "href": "#certifications"
      },
      {
        "i": "_04",
        "k": "Écrire",
        "v": "Me contacter",
        "n": "noa.tournoy@supinfo.com",
        "href": "#contact"
      }
    ],
    "labels": {
      "travaux": "Mes travaux",
      "parcours": "Parcours",
      "stack": "Stack",
      "certs": "Certifications",
      "bref": "En bref"
    },
    "titles": {
      "apropos": { "before": "Ce qu'il faut savoir, ", "em": "en bref", "after": "." },
      "travaux": {
        "before": "Du shader au ",
        "em": "tableau de bord",
        "after": ""
      },
      "parcours": {
        "before": "Du bac NSI à ",
        "em": "l'alternance cyber",
        "after": "."
      },
      "stack": {
        "before": "Ce que j'utilise, et ",
        "em": "où ça a servi",
        "after": "."
      },
      "certs": {
        "before": "Quatre titres, ",
        "em": "tous vérifiables",
        "after": "."
      }
    },
    "time": [
      {
        "when": "Oct. 2026",
        "what": "Alternance cybersécurité",
        "where": "· ADEO, Ronchin",
        "note": "En parallèle du cycle ingénieur à SUPINFO.",
        "now": true
      },
      {
        "when": "Juin → août 2026",
        "what": "Stage développement",
        "where": "· Never2Wait, Tournai",
        "note": "Développement produit. Python, TypeScript, React et Next.js, React Native.",
        "now": false
      },
      {
        "when": "Juin → août 2025",
        "what": "Stage DataSentinel",
        "where": "· ADEO, Ronchin",
        "note": "Tableau de bord de pilotage de la sécurité des produits digitaux. Looker, LookML, Python, React, BigQuery, Terraform, Kubernetes. Certifications Google Looker et LookML.",
        "now": false
      },
      {
        "when": "2024 → 2029",
        "what": "Master of Engineering",
        "where": "· SUPINFO International University",
        "note": "Cycle ingénieur informatique, en cours.",
        "now": false
      },
      {
        "when": "2022",
        "what": "Stage d'observation",
        "where": "· Proges Plus, Willems",
        "note": "Une semaine. L'interface d'un site de gestion RH en HTML et CSS, d'après les maquettes du designer.",
        "now": false
      },
      {
        "when": "2021 → 2024",
        "what": "Baccalauréat",
        "where": "· Institut de Genech",
        "note": "Mention bien. Spécialités mathématiques et NSI.",
        "now": false
      }
    ],
    "stack": [
      {
        "word": "Langages",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/python.svg",
            "name": "Python"
          },
          {
            "icon": "/assets/icons/typescript.svg",
            "name": "TypeScript"
          },
          {
            "icon": "/assets/icons/javascript.svg",
            "name": "JavaScript"
          },
          {
            "icon": "/assets/icons/cplusplus.svg",
            "name": "C++"
          },
          {
            "icon": "/assets/icons/openjdk.svg",
            "name": "Java"
          },
          {
            "icon": "/assets/icons/mysql.svg",
            "name": "SQL"
          }
        ]
      },
      {
        "word": "Web",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/react.svg",
            "name": "React"
          },
          {
            "icon": "/assets/icons/nextdotjs.svg",
            "name": "Next.js"
          },
          {
            "icon": "/assets/icons/nodedotjs.svg",
            "name": "Node.js"
          },
          {
            "icon": "/assets/icons/threedotjs.svg",
            "name": "Three.js"
          },
          {
            "icon": "/assets/icons/expo.svg",
            "name": "Expo"
          },
          {
            "icon": "/assets/icons/electron.svg",
            "name": "Electron"
          }
        ]
      },
      {
        "word": "Infra",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/docker.svg",
            "name": "Docker"
          },
          {
            "icon": "/assets/icons/kubernetes.svg",
            "name": "Kubernetes"
          },
          {
            "icon": "/assets/icons/terraform.svg",
            "name": "Terraform"
          },
          {
            "icon": "/assets/icons/githubactions.svg",
            "name": "GitHub Actions"
          },
          {
            "icon": "/assets/icons/vercel.svg",
            "name": "Vercel"
          },
          {
            "icon": "/assets/icons/git.svg",
            "name": "Git"
          }
        ]
      },
      {
        "word": "Données",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/googlebigquery.svg",
            "name": "BigQuery"
          },
          {
            "icon": "/assets/icons/looker.svg",
            "name": "Looker"
          },
          {
            "icon": "/assets/icons/postgresql.svg",
            "name": "PostgreSQL"
          },
          {
            "icon": "/assets/icons/googlecloud.svg",
            "name": "Google Cloud"
          },
          {
            "icon": "/assets/icons/amazonwebservices.svg",
            "name": "AWS"
          }
        ]
      },
      {
        "word": "Jeu & réseau",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/godotengine.svg",
            "name": "Godot"
          },
          {
            "icon": "/assets/icons/cisco.svg",
            "name": "Cisco"
          }
        ]
      },
      {
        "word": "Langues",
        "plain": true,
        "items": [
          {
            "icon": null,
            "name": "Français"
          },
          {
            "icon": null,
            "name": "Anglais"
          }
        ]
      }
    ],
    "moreWork": "Le détail de chaque travail",
    "moreSkills": "Le détail du savoir-faire",
    "certs": [
      {
        "org": "Google",
        "name": "Looker",
        "note": "Modélisation et exploration de données",
        "when": "2025"
      },
      {
        "org": "Google",
        "name": "LookML",
        "note": "Langage de modélisation sémantique",
        "when": "2025"
      },
      {
        "org": "AWS Academy",
        "name": "Cloud Foundations",
        "note": "Graduate, fondamentaux du cloud",
        "when": "Badge de formation"
      },
      {
        "org": "Cisco",
        "name": "Introduction to Networks",
        "note": "Réseaux, adressage et commutation",
        "when": "CCNA"
      }
    ],
    "contactLabel": "Contact",
    "contactTitle": [
      "Une question technique, une collaboration,",
      "ou juste un des travaux qui vous a arrêté ?"
    ]
  },
  "en": {
    "heroTitre": ["Noa Tournoy,", "full-stack developer", "& systems"],
    "heroSub": [
      {
        "t": "Engineering student in Lille, France, focused on ",
        "b": false
      },
      {
        "t": "cybersecurity",
        "b": true
      },
      {
        "t": ". I build with ",
        "b": false
      },
      {
        "t": "Python",
        "b": true
      },
      {
        "t": ", ",
        "b": false
      },
      {
        "t": "TypeScript",
        "b": true
      },
      {
        "t": " and ",
        "b": false
      },
      {
        "t": "Docker",
        "b": true
      },
      {
        "t": ", from a security dashboard to a 3D web experience. Joining ",
        "b": false
      },
      {
        "t": "ADEO",
        "b": true
      },
      {
        "t": " as an apprentice in October 2026.",
        "b": false
      }
    ],
    "heroCta": "See my work",
    "heroCardLabel": "Éclosion · a 3D web experience, one hundred per cent procedural",
    "heroCardAlt": "The dawn of Éclosion: the sun grazes the horizon above procedural terrain.",
    "mailLabel": "Write an email",
    "bref": [
      {
        "i": "_01",
        "k": "Right now",
        "v": "Engineering degree",
        "n": "SUPINFO, 2024 → 2029",
        "href": null
      },
      {
        "i": "_02",
        "k": "October 2026",
        "v": "Cybersecurity apprenticeship",
        "n": "ADEO, Ronchin",
        "href": null
      },
      {
        "i": "_03",
        "k": "Certifications",
        "v": "Four credentials",
        "n": "Looker · LookML · AWS · CCNA",
        "href": "#certifications"
      },
      {
        "i": "_04",
        "k": "Write",
        "v": "Write to me",
        "n": "noa.tournoy@supinfo.com",
        "href": "#contact"
      }
    ],
    "labels": {
      "travaux": "My work",
      "parcours": "Path",
      "stack": "Stack",
      "certs": "Certifications",
      "bref": "At a glance"
    },
    "titles": {
      "apropos": { "before": "What is worth knowing, ", "em": "at a glance", "after": "." },
      "travaux": {
        "before": "From shader to ",
        "em": "dashboard",
        "after": ""
      },
      "parcours": {
        "before": "From a maths and CS baccalaureate to ",
        "em": "a cybersecurity apprenticeship",
        "after": "."
      },
      "stack": {
        "before": "What I use, and ",
        "em": "where it served",
        "after": "."
      },
      "certs": {
        "before": "Four credentials, ",
        "em": "all verifiable",
        "after": "."
      }
    },
    "time": [
      {
        "when": "Oct. 2026",
        "what": "Cybersecurity apprenticeship",
        "where": "· ADEO, Ronchin",
        "note": "Alongside the engineering degree at SUPINFO.",
        "now": true
      },
      {
        "when": "June → Aug. 2026",
        "what": "Development internship",
        "where": "· Never2Wait, Tournai",
        "note": "Product development. Python, TypeScript, React and Next.js, React Native.",
        "now": false
      },
      {
        "when": "June → Aug. 2025",
        "what": "Internship DataSentinel",
        "where": "· ADEO, Ronchin",
        "note": "A dashboard for monitoring the security of digital products. Looker, LookML, Python, React, BigQuery, Terraform, Kubernetes. Google Looker and LookML certifications.",
        "now": false
      },
      {
        "when": "2024 → 2029",
        "what": "Master of Engineering",
        "where": "· SUPINFO International University",
        "note": "Computer engineering programme, in progress.",
        "now": false
      },
      {
        "when": "2022",
        "what": "Observation placement",
        "where": "· Proges Plus, Willems",
        "note": "One week. The front end of an HR management site in HTML and CSS, from the designer's mockups.",
        "now": false
      },
      {
        "when": "2021 → 2024",
        "what": "Baccalauréat",
        "where": "· Institut de Genech",
        "note": "Passed with honours. Mathematics and computer science majors.",
        "now": false
      }
    ],
    "stack": [
      {
        "word": "Languages",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/python.svg",
            "name": "Python"
          },
          {
            "icon": "/assets/icons/typescript.svg",
            "name": "TypeScript"
          },
          {
            "icon": "/assets/icons/javascript.svg",
            "name": "JavaScript"
          },
          {
            "icon": "/assets/icons/cplusplus.svg",
            "name": "C++"
          },
          {
            "icon": "/assets/icons/openjdk.svg",
            "name": "Java"
          },
          {
            "icon": "/assets/icons/mysql.svg",
            "name": "SQL"
          }
        ]
      },
      {
        "word": "Web",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/react.svg",
            "name": "React"
          },
          {
            "icon": "/assets/icons/nextdotjs.svg",
            "name": "Next.js"
          },
          {
            "icon": "/assets/icons/nodedotjs.svg",
            "name": "Node.js"
          },
          {
            "icon": "/assets/icons/threedotjs.svg",
            "name": "Three.js"
          },
          {
            "icon": "/assets/icons/expo.svg",
            "name": "Expo"
          },
          {
            "icon": "/assets/icons/electron.svg",
            "name": "Electron"
          }
        ]
      },
      {
        "word": "Infra",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/docker.svg",
            "name": "Docker"
          },
          {
            "icon": "/assets/icons/kubernetes.svg",
            "name": "Kubernetes"
          },
          {
            "icon": "/assets/icons/terraform.svg",
            "name": "Terraform"
          },
          {
            "icon": "/assets/icons/githubactions.svg",
            "name": "GitHub Actions"
          },
          {
            "icon": "/assets/icons/vercel.svg",
            "name": "Vercel"
          },
          {
            "icon": "/assets/icons/git.svg",
            "name": "Git"
          }
        ]
      },
      {
        "word": "Data",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/googlebigquery.svg",
            "name": "BigQuery"
          },
          {
            "icon": "/assets/icons/looker.svg",
            "name": "Looker"
          },
          {
            "icon": "/assets/icons/postgresql.svg",
            "name": "PostgreSQL"
          },
          {
            "icon": "/assets/icons/googlecloud.svg",
            "name": "Google Cloud"
          },
          {
            "icon": "/assets/icons/amazonwebservices.svg",
            "name": "AWS"
          }
        ]
      },
      {
        "word": "Games & networks",
        "plain": false,
        "items": [
          {
            "icon": "/assets/icons/godotengine.svg",
            "name": "Godot"
          },
          {
            "icon": "/assets/icons/cisco.svg",
            "name": "Cisco"
          }
        ]
      },
      {
        "word": "Spoken",
        "plain": true,
        "items": [
          {
            "icon": null,
            "name": "Français"
          },
          {
            "icon": null,
            "name": "Anglais"
          }
        ]
      }
    ],
    "moreWork": "Every project in detail",
    "moreSkills": "Skills in detail",
    "certs": [
      {
        "org": "Google",
        "name": "Looker",
        "note": "Data modelling and exploration",
        "when": "2025"
      },
      {
        "org": "Google",
        "name": "LookML",
        "note": "Semantic modelling language",
        "when": "2025"
      },
      {
        "org": "AWS Academy",
        "name": "Cloud Foundations",
        "note": "Graduate, cloud fundamentals",
        "when": "Training badge"
      },
      {
        "org": "Cisco",
        "name": "Introduction to Networks",
        "note": "Networking, addressing and switching",
        "when": "CCNA"
      }
    ],
    "contactLabel": "Contact",
    "contactTitle": [
      "A technical question, a collaboration,",
      "or just one of the projects that stopped you?"
    ]
  }
} as const;
