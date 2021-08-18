export const stepList = [
  "Title",
  "Resource Type",
  "Subject Area",
  "Description",
  "Grade",
  "Skills",
  "Standards",
  "Reading Level",
  "Keywords",
  "Files",
  "Images",
  "Status"
]

export const statusData = [
  {
    statusText : "Inactive",
    subTitle : "Get it approved.",
    description : `Please inspect a live preview for this listing, by clicking the image to your right,
                         to double check the information and files you've provided. Then, when ready, submit
                         it for review.`
  },  // before submit - in Draft
  {
    statusText : "In Review",
    subTitle : "Resource submitted.",
    description : `Your resource is now being reviewed to be certain it meets our
                         standards for publication. you will be notified via email of
                         approval or declination, typically within 48 hours`
  }, // after submit - waiting for review
  {
    statusText : "Activate",
    subTitle : "Successfully published.",
    description : `Your resource has been approved for publication in the
                         Learningful digital library. That means it is now available
                         for all users to download and enjoy for free. Yay!`
  },  // approved by admin
  {
    statusText : "Inactive",
    subTitle : "Pending correction.",
    description : `Your resource was reviewed and unfortunately did not meet
                         Learningful's standards for publication. We invite you to improve
                         your listing, and resubmit it, at your convenience.`
  },  // not approved by admin - need some change and resubmit
  {
    statusText : "Incomplete",
    subTitle : "Correction required.",
    description : `This resource listing currently has one or more incomplete
                         sections of required information and cannot be submitted for review
                         until you correct all omissions.`
  },// there 's uncompleted steps
  {
    statusText : "Inactive",
    subTitle : "Not showing on Learningful.",
    description : `This resource was manually deactivated by you. It can be
                         reactivated at any time, but if you make any changes to the files or
                         images, this listing will need to be reapproved.`
  }   // when an user manually deactivated it
]

export const multiButton = [
  { class : '', text : 'Submit'},
  { class : '', text : 'Cancel'},
  { class : '', text : 'Deactivate'},
  { class : 'disabled', text : 'Submit'},
  { class : 'disabled', text : 'Submit'},
  { class : '', text : 'Reactivate'}
]

export const totalPages = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]

export const gradeLevel = [
  { value : 0, text : 'P' },
  { value : 0, text : 'K' },
  { value : 0, text : '1' },
  { value : 0, text : '2' },
  { value : 0, text : '3' },
  { value : 0, text : '4' },
  { value : 0, text : '5' },
  { value : 0, text : '6' },
  { value : 0, text : '7' },
  { value : 0, text : '8' },
  { value : 0, text : '9' },
  { value : 0, text : '10' },
  { value : 0, text : '11' },
  { value : 0, text : '12' }
]
