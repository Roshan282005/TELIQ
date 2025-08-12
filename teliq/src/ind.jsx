
function inn(){
    return(
        <>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
        <div className="comment">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
           className="chat-icon">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
            <line x1="9" y1="14" x2="13" y2="14"/>
          </svg>   
        </div>
        <div className="phone"><i className="fa fa-phone"></i></div>
        <div className="container">
        <h1 className="h1"><i className="fab fa-whatsapp"></i>𐌕𐌄𐌋𐌉𐌒
        </h1>
        <div className="navBar">
        <div className="ham-menu " style={{ zIndex: 2 }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          </div>
        </div>
        <div className="innerContainer">
            <h2>Chats</h2>
        </div>
        </>
    );
}

export default inn