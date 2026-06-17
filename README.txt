Installation Supabase + GitHub Pages

1. Crée un projet sur Supabase.
2. Va dans SQL Editor et exécute le fichier supabase-setup.sql.
3. Va dans Project Settings > API.
4. Copie Project URL et anon public key.
5. Dans index.html, remplace :
   A_REMPLACER_PAR_TON_SUPABASE_URL
   A_REMPLACER_PAR_TON_SUPABASE_ANON_KEY
6. Remplace les fichiers de ton dépôt GitHub Pages par ceux de ce ZIP.

Important : cette version sépare les données par prénom, mais ce n'est pas une vraie sécurité.
Toute personne qui connaît un prénom peut l'ouvrir. Pour une vraie sécurité, il faudra ajouter email + mot de passe.
