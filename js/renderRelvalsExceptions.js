//------------------------------------------------------------------------------------------
// Tabs and Menu Bar
//------------------------------------------------------------------------------------------


/**
 * receives the structure from the json file with all the release queues grouped
 * It generates a Menu Bar to open the different tabs
 */
getMenuBar = function(structure){
  var allQueues = structure.all_prefixes
  var menuBar = $('<nav>')
  menuBar.attr( 'id', 'topNavBar' ).attr( 'class', 'navbar navbar-primary').attr( 'role', 'navigation' ) 

  var barContainer = $('<div>')
  barContainer.attr( 'class', 'container-fluid' )
  menuBar.append( barContainer )

  var navBarCollapse = $('<div>')
  navBarCollapse.attr( 'class', 'collapse navbar-collapse' ).attr( 'id', 'bs-example-navbar-collapse-1' )
  barContainer.append(navBarCollapse)

  var navBarUl = $('<ul>')
  navBarUl.attr( 'class', 'nav navbar-nav' )
  navBarCollapse.append(navBarUl)

  for(var i = 0; i < allQueues.length; i++){
    addDropDownList(navBarUl,allQueues[i],structure[allQueues[i]])
  }
return menuBar
} 

/**
 * Adds a drop down list to a menu list item
 */
addDropDownList = function( navBarUl, releaseName, releaseQueues ){

  var liRelName = $('<li>')
  liRelName.attr( 'class', 'dropdown' )
  linkTitle = $( '<a>' )
  linkTitle.attr( 'class', 'dropdown-toggle' ).attr( 'data-toggle', 'dropdown').attr( 'href', '#' )
  linkTitle.text( releaseName )

  linkTitle.append( $('<b>').attr( 'class', 'caret' ) )
  liRelName.append(linkTitle)
  navBarUl.append(liRelName)

  var dropDownMenu = $('<ul class="dropdown-menu">')
  dropDownMenu.attr( 'class', 'dropdown-menu' )
  liRelName.append(dropDownMenu)

  for (var i = 0; i < releaseQueues.length; i++){
    var releaseQueue = releaseQueues[i]
    var link = $('<a>').text(releaseQueue).attr("href", '#'+releaseQueue)
    link.attr( 'id', 'link-to-tab-' + releaseQueue )
    var liReleaseQueue = $('<li>').append(link)
    link.click(function (e) {
      e.preventDefault()
      var tab = $(this).attr('href')
      loadTabPane( tab.replace( '#', '') )
      $('#myTab a[href='+tab+']').tab('show')
      console.log(   $('#myTab a[href='+tab+']').children().length )
    })
    dropDownMenu.append(liReleaseQueue)
    liReleaseQueue = null
  }
}

/**
 * creates and returns the tabs based on the json structure
 */
getTabs = function( structure ){

  var tabs = $( '<ul>' )
  tabs.attr( 'id', 'myTab' ).attr( 'class', 'nav nav-tabs hidden' )

  var all_releases = structure.all_release_queues
  
  for(var i = 0; i < all_releases.length; i++){
    var releaseQueue = all_releases[i];
    var tab_title = $('<li><a href="#'+releaseQueue+'" data-toggle="tab">'+releaseQueue+'</a></li>')
    tabs.append( tab_title )
  } 

  return tabs

}

/**
 * creates and returns the tabs panes inside a div to put the content on them,
 * based on the structure
*/
getTabPanes = function( structure ){

  var tabs_content = $('<div>')
  tabs_content.attr("id","tabs_container").attr( 'class', 'tab-content' )
  var all_releases = structure.all_release_queues

  for(var i = 0; i < all_releases.length; i++){
    var releaseQueue = all_releases[i];
    var tab_pane = $('<div>')
    tab_pane.attr( 'id', releaseQueue )
    tab_pane.attr( ALREADY_LOADED_ATTR, 'no' )

    //by default, the first one is the one which starts as active
    if ( i == 0 ){
      tab_pane.attr( 'class', 'tab-pane active' )      
    }else{
      tab_pane.attr( 'class', 'tab-pane' )
    }

    // write the titles for the release queue
    var title_rel_name=$( "<h1>" ).text( releaseQueue )
    tab_pane.append( title_rel_name )
    tab_pane.append( $( "<hr>" ) )

    var ibPagesLink = $( '<a>' )
    tab_pane.append( ibPagesLink )
    ibPagesLink.attr( 'href', 'https://cmssdt.cern.ch/SDT/html/showIB.html#' + releaseQueue )
    ibPagesLink.append( $( '<small>' ).text( 'Back to IB pages') )

    tab_pane.append( $( "<br>" ) )
    tabs_content.append( tab_pane )
  }

  return tabs_content
}

//------------------------------------------------------------------------------------------
// Tabs Content
//------------------------------------------------------------------------------------------

/**
 * fills tab panes based on the structure. It determines the correct files to download 
 * and calls the function to add this information to the tab pane
 */
fillTabPanes = function( structure ){
  $.getJSON( "data/RelvalsAvailableResults.json", loadFilesLists )

}


/**
 * It reads the file data/RelvalsAvailableResults.json and creates a list of files to read 
 * per eachIB. This files have the information about which exceptions are found in the IB
 */
loadFilesLists = function( relvasAvailableResults ){
 
  // this is to organize the keys before showing the ibs
  exceptionsAvailResults = {}
  
  for( key in relvasAvailableResults ){

    if( key.indexOf( "EXCEPTIONS" ) >= 0 ){
      var ib = key.replace( "_EXCEPTIONS", "" )
      exceptionsAvailResults[ ib ] = relvasAvailableResults[ key ]
    }
  }

  allIBs = $.map( exceptionsAvailResults, function(element,index) {return index}).sort().reverse()

  for( var i = 0; i < allIBs.length ; i++ ){

    currentIB = allIBs[ i ]
    var archs = relvasAvailableResults[ currentIB + '_EXCEPTIONS' ]
    var releaseQueue = currentIB.substring( 0 , currentIB.lastIndexOf( "_" ) )                 
      
    var tabPane = $( '#'+releaseQueue )
    var title = $( '<h3>' ).text( currentIB ).attr( 'id', currentIB )

    title.attr( AVAILABLE_ARCHS_ATTR, exceptionsAvailResults[ currentIB ] )
    tabPane.append( title )   

    var ibPagesLink = $( '<a>' )
    title.after( ibPagesLink )
    var hr = $( '<hr>' )
    ibPagesLink.after( hr )

    ibPagesLink.attr( 'href', 'https://cmssdt.cern.ch/SDT/html/showIB.html#' + currentIB )
    ibPagesLink.append( $( '<small>' ).text( 'See all results for ' + currentIB ) )

    var containerRow = $( '<div>' ).attr( 'class', 'row' )
    hr.after( containerRow )
    addHeaderRow( containerRow )
    var containerColumn = $( '<div>' ).attr( 'class', 'col-md-10' )
    containerColumn.attr( 'id', 'container-' + currentIB )
    containerRow.append( containerColumn )

 }

  process_hash()

  loadActiveTabPane()

}

/**
 * adds a row to the container of each IB results, with the titles 'Exception', and 'Workflows'
 */
addHeaderRow = function( containerRow ){


  var exTitleColumn = $( '<div>' ).attr( 'class', 'col-md-8' )
  containerRow.append( exTitleColumn )
  var exTitle = $( '<b>' ).text( 'Exception' )
  exTitleColumn.append( exTitle )
 
  var wfsTitleColumn = $( '<div>' ).attr( 'class', 'col-md-4' )
  containerRow.append( wfsTitleColumn )
  var wfsTitle = $( '<b>' ).text( 'Workflows' )
  wfsTitleColumn.append( wfsTitle )

  var hrCont = $( '<div>' ).attr( 'class', 'col-md-12' )
  containerRow.append( hrCont.append( $( '<hr>' ) ) )

}

/**
 * selects the tab pane that is active and loads it
 */
loadActiveTabPane = function(){

  var activeTab = $( '.active' )
  console.log( activeTab )
  
  var releaseQueue = activeTab.attr( 'id' )
  loadTabPane( releaseQueue )
}

/**
 * Iterates on the tables of the IBs and loads them with the information 
 * from the corresponding files
 */
loadTabPane = function( releaseQueue ){

  var tabPane = $( '#' + releaseQueue )
  alreadyLoaded = tabPane.attr( ALREADY_LOADED_ATTR )
  if ( alreadyLoaded == 'yes' ){
    return 
  }
  console.log( 'loading' + releaseQueue )
  var titles = tabPane.children( "h3" )
  titles.each( loadTable )

  tabPane.attr( ALREADY_LOADED_ATTR, 'yes' )

}

/**
 * loads a table based on its attributes. it knows which IB to use based on the id of the title
 * It uses the bootstrap grid system to organize the tables
 * it can be called by a .each()
 */
loadTable = function( title ){

  if( $.isNumeric( title ) ){
    title = $( this )
  }

  

  var ib = title.attr( 'id' )
  var archs = title.attr( AVAILABLE_ARCHS_ATTR )
  var archs_list = archs.split( "," )
  var releaseQueue = ib.substring( 0 , ib.lastIndexOf( "_" ) )
  var ibDate = ib.substring( ib.lastIndexOf( "_" ) + 1 , ib.length )
 
  for( var i = 0; i < archs_list.length; i++ ){
    current_arch = archs_list[ i ]
    filenameExceptions = 'data/relvals/' + current_arch + '/' + ibDate + '/' + releaseQueue + '_EXCEPTIONS.json'
    infoAdderFunct = genAddInfoTable( title, current_arch )
    $.getJSON( filenameExceptions, infoAdderFunct )

  }

}

genAddInfoTable = function( title, arch ){
  /**
   * Adds the rows with the information of the exceptions for the title element for which this function
   * is generated. It uses the bootstrap grid system
   */
  addInfoTable = function( structure ){
    var ib = title.attr( 'id' )
    var container = $( '#container-' + ib )

    var counter = 0
    for( exception in structure ){
      archsParagraphID = IB_EXCEPTIONS_SUBPS_IDS[ ib + ',' + exception ]
           
      if ( archsParagraphID == undefined ){

        var row = $( '<div>' ).attr( 'class', 'row' )
        container.append( row )

        var exColumn = $( '<div>' ).attr( 'class', 'col-md-8' )
        row.append( exColumn )
        var samp = $( '<samp>' )
        samp.text( exception )        
        var paragraph = $( '<pre>' ).append( samp )
        exColumn.append( $( '<small>' ).append( paragraph ) )

        // create a column for the architectures
        var archsColumn = $( '<div>' ).attr( 'class', 'col-md-4' )
        row.append( archsColumn ) 

        var archsParagraph = $( '<p>' )
        archsParagraph.attr( 'align', 'justify' )
        archsColumn.append( archsParagraph )

        var archsParagraphID = ib + '-' + arch + '-' + counter
        archsParagraph.attr( 'id', archsParagraphID )
        IB_EXCEPTIONS_SUBPS_IDS[ ib + ',' + exception ] = archsParagraphID

        addArchAndWorkflowsSubTable( archsParagraph, structure[ exception ], arch, ib )

        counter++
      }else {
       
        archsParagraph = $( '#' + archsParagraphID )
        addArchAndWorkflowsSubTable( archsParagraph, structure[ exception ], arch, ib )

      }

    }
    
    if ( ib == document.location.toString().split('#')[1] ){
      scrollTo( ib )
    }



  }

  return addInfoTable
}


/**
 * Adds to the archs subtable for an IB the correspongin information
 * of the list of workflows
 */
addArchAndWorkflowsSubTable = function( archsParagraph, wfList, arch, ib ){
  
  var archLink = $( '<a>' )
  archLink.attr( 'href', 'https://cms-sw.github.io/relvalLogDetail.html#' + arch + ';' + ib )
  archLink.text( arch + ': ' )
  archsParagraph.append( archLink )
   
  archsParagraph.append( $( '<pre>' ).text( wfList.join(", ") ) )
  archsParagraph.append( $( '<br>' ) )


}

// ---------------------------------------------------------------------------------
// Handle URL
// ---------------------------------------------------------------------------------

/**
 * Makes the page scroll to the id given as a parameter
 */
scrollTo = function( id ){
  $('html, body').animate({
        scrollTop: $( '#' + id ).offset().top
      }, 1500);

}

// processes the hash given in the url
process_hash = function( hash ){
 
  var url = document.location.toString()
  if ( url.match('#') ) {
             
 
    var hash = url.split('#')[1]
    var releaseQueue = hash.substring( 0 , hash.lastIndexOf( '_' ) )
    var lastChar = hash.charAt( hash.length - 1 )
    if ( lastChar == 'X' || lastChar == 'C' ){
      $( '#myTab a[href=#' + hash + ']').tab('show')
    }else {
      console.log( 'IB' )
       // the url is asking for an IB
      $( '#myTab a[href=#' + releaseQueue + ']').tab('show')
      
    }

   var activeToCleanup = $( 'li.active' )
   activeToCleanup.attr( 'class', '' )
}

}


// max column number for the workflows subtable
MAX_COLUMNS_WFS = 5
// custom properties
ALREADY_LOADED_ATTR = 'already-loaded'
AVAILABLE_ARCHS_ATTR = 'avialable-archs'

IB_EXCEPTIONS_SUBPS_IDS = {}
