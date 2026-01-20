document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and display activities
  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      displayActivities(activities);
      populateActivitySelect(activities);
    } catch (error) {
      console.error("Error loading activities:", error);
      document.getElementById("activities-list").innerHTML =
        '<p class="error">Failed to load activities. Please try again later.</p>';
    }
  }

  // Display activities in the list
  function displayActivities(activities) {
    activitiesList.innerHTML = "";

    Object.entries(activities).forEach(([name, details]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      const participantsList = details.participants
        .map((email) => `<li>${email}</li>`)
        .join("");

      card.innerHTML = `
        <h4>${name}</h4>
        <p><strong>Description:</strong> ${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
        <div class="participants-section">
          <h5>Current Participants <span class="participants-count">(${details.participants.length})</span></h5>
          <ul class="participants-list">
            ${participantsList || '<li style="color: #999;">No participants yet</li>'}
          </ul>
        </div>
      `;

      activitiesList.appendChild(card);
    });
  }

  // Populate activity select dropdown
  function populateActivitySelect(activities) {
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.keys(activities).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.className = "message success";
        messageDiv.textContent = result.message;
        messageDiv.classList.remove("hidden");

        // Reload activities to show updated participant list
        await loadActivities();

        // Reset form
        signupForm.reset();
      } else {
        throw new Error(result.detail || "Signup failed");
      }
    } catch (error) {
      messageDiv.className = "message error";
      messageDiv.textContent = error.message;
      messageDiv.classList.remove("hidden");
    }

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  });

  // Load activities when page loads
  loadActivities();
});
