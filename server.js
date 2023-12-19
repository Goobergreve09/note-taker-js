const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('./helpers/uuid');



const app = express();

const PORT = 3001;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//GET methods for HTML files
app.get('/notes', (request, response) => {
    response.sendFile(path.join(__dirname, '/public/notes.html'));
  });
  
  app.get('/api/notes', (request, response) => {
    // Read the contents of db.json and send as JSON response
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        response.status(500).json('Error reading notes from the server');
      } else {
        const parsedNotes = JSON.parse(data);
        response.status(200).json(parsedNotes);
      }
    });
  });
  app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
  
    const title = req.body.title;
    const text = req.body.text;
  
    if (title && text) {
      const newNote = {
        title,
        text,
        id: uuid(),
      };
  
      fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json('Error in posting note');
        } else {
          const parsedNotes = JSON.parse(data);
  
          parsedNotes.push(newNote);
  
          fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) => {
            if (writeErr) {
              console.error(writeErr);
              res.status(500).json('Error in posting note');
            } else {
              console.info('Successfully updated Notes!');
              const response = {
                status: 'success',
                body: newNote,
              };
              console.log(response);
              res.status(201).json(response);
            }
          });
        }
      });
    } else {
      res.status(500).json('Error in posting note');
    }
  });
  app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
  
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json('Error reading notes from the server');
      }
  
      let parsedNotes = JSON.parse(data);
  
      // Find index of the note with the given ID
      const noteIndex = parsedNotes.findIndex((note) => note.id === noteId);
  
      if (noteIndex !== -1) {
        // Remove the note from the array
        parsedNotes.splice(noteIndex, 1);
  
        // Write the updated notes back to db.json
        fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            return res.status(500).json('Error deleting note');
          }
  
          console.info('Successfully deleted note!');
          return res.status(200).json('Note deleted successfully');
        });
      } else {
        // Note not found
        res.status(404).json('Note not found');
      }
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
  });