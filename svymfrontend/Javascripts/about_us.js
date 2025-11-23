document.addEventListener('DOMContentLoaded', () => {
    const aboutUsDescription = document.getElementById('aboutUsDescription');
    const missionText = document.getElementById('missionText');
    const visionText = document.getElementById('visionText');
    const valuesText = document.getElementById('valuesText');
    const teamMembersContainer = document.getElementById('teamMembersContainer');

    // Fetch About Us data (excluding team)
    fetch('/.netlify/functions/org-get-aboutus')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch About Us data');
            }
            return response.json();
        })
        .then(data => {
            // Clear any existing content if any
            aboutUsDescription.textContent = '';
            missionText.textContent = '';
            visionText.textContent = '';
            valuesText.textContent = '';

            // Inject description
            if (data.description) {
                aboutUsDescription.textContent = data.description;
            }

            // Inject mission
            if (data.mission) {
                missionText.textContent = data.mission;
            }

            // Inject vision
            if (data.vision) {
                visionText.textContent = data.vision;
            }

            // Inject values
            if (data.values) {
                valuesText.textContent = data.values;
            }
        })
        .catch(error => {
            console.error('Error loading About Us:', error);
            aboutUsDescription.textContent = 'Failed to load About Us data. Please try again later.';
        });

    // Fetch Team Members data separately
    fetch('/.netlify/functions/org-get-team')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch Team Members data');
            }
            return response.json();
        })
        .then(teamData => {
            // Clear current team members
            teamMembersContainer.innerHTML = '';

            if (Array.isArray(teamData) && teamData.length > 0) {
                teamData.forEach(member => {
                    const memberDiv = document.createElement('div');
                    memberDiv.classList.add('member');

                    // Member icon (optional)
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user-tie';
                    memberDiv.appendChild(icon);

                    // Member name
                    const name = document.createElement('h4');
                    name.textContent = member.name || 'Name not provided';
                    memberDiv.appendChild(name);

                    // Member designation (role)
                    const designation = document.createElement('p');
                    designation.textContent = member.role || '';
                    memberDiv.appendChild(designation);

                    teamMembersContainer.appendChild(memberDiv);
                });
            }
        })
        .catch(error => {
            console.error('Error loading Team Members:', error);
            // Optionally display error message in team section
            teamMembersContainer.textContent = 'Failed to load team members. Please try again later.';
        });
});
