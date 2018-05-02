// Instance the tour
var tour = new Tour({
	steps: [
		{
			orphan: true,
			title: "CourseBuilder",
			content: "Welcome to CourseBuildr. You'll need to create a new course to get started (an example course has been created for you already). Let's show you around.",
			backdrop: true,
		},
		{
			element: "header.template-header .centering figure:first",
			title: "Creating new courses",
			content: "Click on any of these templates to make a new instance of a course. These templates affect the layout and player code but can be changed later",
		},
		{
			element: "header.template-header .centering .hinting h2",
			title: "Uploading courses",
			content: "You can drag and drop on previously created courses to upload them again.",			
		},
		{
			element: "header.search-header .search-container",
			title: "Search your courses",
			content: "As your course list fills up you might need to filter the list to get to what you need. Just type to instantly search the list."
		},
		{
			element: "section.course-list .course-row:first div.name a",
			title: "Editing",
			content: "Click on the name of a course to edit it",
			placement: "top"
		},
		{
			element: "section.course-list .course-row:first div.stage",
			title: "Planning",
			content: "Use these optional label controls to classify your courses",
			placement: "top"
		},
		{
			element: "section.course-list .course-row:first div.tools",
			title: "Tools",
			content: "Use these buttons to play, clone, lock or delete courses (only locked courses can be deleted)",
			placement: "bottom"
		},
		{
			element: "footer.logo-copyright-help a:first",
			title: "Getting help",
			content: "Use the online documentation to find out about specific features or commands"
		},
		{
			element: "section.course-list .course-row:first div.name a",
			title: "Ready?",
			content: "Try clicking this course name to start editing."
		},

]});

// Initialize the tour
tour.init();

// Start the tour
tour.start(true);
