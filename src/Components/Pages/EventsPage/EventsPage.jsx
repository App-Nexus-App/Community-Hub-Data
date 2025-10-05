import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import EventCard from '../../Cards/EventCard/EventCard';
import LocationInput from './LocationInput';
import { fetchEvents, addEvent, deleteEvent, updateEvent } from '../../Data/firebaseEvents';
import emailjs from "emailjs-com";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Data/firebase";  // ensure db is exported from your firebase.js
import './Events.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [showNewEvent, setShowNewEvent] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    category: '',
    location: {
      addressLine1: '',
      suburb: '',
      city: '',
      postalCode: ''
    },
    date: '',
    volunteers: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch all events on load
  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      setEvents(data);
    };
    loadEvents();
  }, []);

  // Filter upcoming events
  const today = new Date();
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });

  // Handle create/update event
  const handleCreateEvent = async () => {
    try {
      // 🔹 Validation
      if (
        !newEvent.title ||
        !newEvent.location.addressLine1 ||
        !newEvent.location.city ||
        !newEvent.date
      ) {
        setMessage("Please fill in all required fields.");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 1000);
        return;
      }

      // 🔹 Combine location into a single string for storage
      const locationString = `${newEvent.location.addressLine1}, ${newEvent.location.suburb}, ${newEvent.location.city}, ${newEvent.location.postalCode}`;

      if (newEvent.id) {
        // Updating existing event
        const { id, ...eventData } = newEvent;
        await updateEvent(id, { ...eventData, location: locationString });
        setMessage("Event updated successfully!");
        setMessageType("success");
      } else {
        // Creating new event
        await addEvent({ ...newEvent, location: locationString });
        setMessage("Event created successfully!");
        setMessageType("success");

        // Fetch volunteers and send emails
        const snapshot = await getDocs(collection(db, "volunteers"));
        const volunteers = snapshot.docs.map(doc => doc.data());

        for (const volunteer of volunteers) {
          await emailjs.send(
            "service_2urq71w",
            "template_pa7cyff",
            {
              to_email: volunteer.email,
              to_name: volunteer.name || "Ubuntu Volunteer",
              event_title: newEvent.title,
              event_date: newEvent.date,
              event_location: locationString,
              event_volunteers: newEvent.volunteers || "N/A"
            },
            "cvMymiNn_bcU1gDbd"
          ).then(
            () => console.log(`✅ Email sent to ${volunteer.email}`),
            (error) => console.error(`❌ Failed to send to ${volunteer.email}:`, error)
          );
        }
      }

      // Reset form
      setNewEvent({
        title: '',
        category: '',
        location: {
          addressLine1: '',
          suburb: '',
          city: '',
          postalCode: ''
        },
        date: '',
        volunteers: ''
      });
      setShowNewEvent(false);

      const updatedEvents = await fetchEvents();
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Failed to create/update event:", error);
      setMessage("Failed to create or update event. Please try again.");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const handleEdit = (event) => {
    // 🔹 Parse location string into parts
    const [addressLine1 = '', suburb = '', city = '', postalCode = ''] =
      event.location?.split(',').map(s => s.trim()) || [];

    setNewEvent({
      ...event,
      location: { addressLine1, suburb, city, postalCode }
    });
    setShowNewEvent(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Community Events</h1>
        <button onClick={() => setShowNewEvent(true)} className="add-button">
          <Plus className="plus-icon" />
        </button>
      </div>

      {showNewEvent && (
        <div className="event-form">
          <h3 className="form-title">Create Ubuntu Event</h3>
          <div className="form-fields">
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="form-input"
            />
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              className="form-input"
            >
              <option value="">Select Category</option>
              <option value="soup-kitchen">Food Drive</option>
              <option value="clothing">Clothing Drive</option>
              <option value="pads">Pads Drive</option>
              <option value="food">Food Sharing</option>
            </select>

            {/* 🔹 Location Inputs */}
            <input
              type="text"
              placeholder="Address Line 1"
              value={newEvent.location.addressLine1}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  location: { ...newEvent.location, addressLine1: e.target.value }
                })
              }
              className="form-input"
            />
            <input
              type="text"
              placeholder="Suburb"
              value={newEvent.location.suburb}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  location: { ...newEvent.location, suburb: e.target.value }
                })
              }
              className="form-input"
            />
            <input
              type="text"
              placeholder="City"
              value={newEvent.location.city}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  location: { ...newEvent.location, city: e.target.value }
                })
              }
              className="form-input"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={newEvent.location.postalCode}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  location: { ...newEvent.location, postalCode: e.target.value }
                })
              }
              className="form-input"
            />

            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Volunteers Needed"
              value={newEvent.volunteers}
              onChange={(e) =>
                setNewEvent({ ...newEvent, volunteers: parseInt(e.target.value) || 0 })
              }
              className="form-input"
            />

            <div className="form-actions">
              <button onClick={handleCreateEvent} className="submit-button">
                {newEvent.id ? "Update Event" : "Create Event"}
              </button>
              <button onClick={() => setShowNewEvent(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className={`event-message ${messageType}`}>{message}</p>
      )}

      <div className="events-list">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p>No upcoming events.</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
