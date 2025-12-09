#!/usr/bin/osascript -l JavaScript

// Export notes from a specific folder
// Run: ./notes-exporter.js "Folder Name"

function cleanHtml(html) {
   let cleaned = html;

   // Replace <tt> with <code>
   cleaned = cleaned.replace(/<tt>/g, "<code>");
   cleaned = cleaned.replace(/<\/tt>/g, "</code>");

   // Remove Apple-dash-list class from ul elements
   cleaned = cleaned.replace(/<ul class="Apple-dash-list">/g, "<ul>");

   // Strip inline styles from table elements
   cleaned = cleaned.replace(/<table[^>]*>/g, "<table>");
   cleaned = cleaned.replace(/<td[^>]*>/g, "<td>");
   cleaned = cleaned.replace(/<tr[^>]*>/g, "<tr>");
   cleaned = cleaned.replace(/<tbody[^>]*>/g, "<tbody>");

   // Remove <object> wrappers around tables
   cleaned = cleaned.replace(/<object>/g, "");
   cleaned = cleaned.replace(/<\/object>/g, "");

   // Unwrap <div> elements - replace with just their content
   // First handle divs that just contain a <br>
   cleaned = cleaned.replace(/<div><br><\/div>/g, "\n");

   // Remove opening and closing div tags but keep content
   cleaned = cleaned.replace(/<div>/g, "");
   cleaned = cleaned.replace(/<\/div>/g, "\n");

   // Clean up newlines inside table cells
   cleaned = cleaned.replace(/<td>\n*/g, "<td>");
   cleaned = cleaned.replace(/\n*<\/td>/g, "</td>");

   // Replace <br> with newlines
   cleaned = cleaned.replace(/<br>/g, "\n");

   // Clean up excess newlines (more than 2 in a row)
   cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

   // Trim leading/trailing whitespace
   cleaned = cleaned.trim();

   return cleaned;
}

function run(argv) {
   const targetFolder = argv[0];

   if (!targetFolder) {
      return 'Usage: ./notes-exporter.js "test"';
   }

   const Notes = Application("Notes");
   const accounts = Notes.accounts();

   if (accounts.length === 0) {
      return "No Notes accounts found";
   }

   let folder = null;

   // Search for folder across all accounts
   for (const account of accounts) {
      const folders = account.folders();
      for (const f of folders) {
         if (f.name() === targetFolder) {
            folder = f;
            break;
         }
      }
      if (folder) break;
   }

   if (!folder) {
      return `Folder "${targetFolder}" not found`;
   }

   const notes = folder.notes();

   if (notes.length === 0) {
      return "No notes found";
   }

   // Get the first note
   const note = notes[0];
   const rawBody = note.body();
   const cleanedBody = cleanHtml(rawBody);

   let output = "";
   output += "=".repeat(60) + "\n";
   output += "NOTE TITLE:\n";
   output += note.name() + "\n\n";
   output += "=".repeat(60) + "\n";
   output += "RAW BODY CONTENT:\n";
   output += "=".repeat(60) + "\n";
   output += rawBody + "\n";
   output += "=".repeat(60) + "\n";
   output += "CLEANED BODY CONTENT:\n";
   output += "=".repeat(60) + "\n";
   output += cleanedBody + "\n";
   output += "=".repeat(60) + "\n";

   return output;
}
