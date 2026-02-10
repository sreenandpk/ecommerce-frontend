import Slider from "react-slick";

export default function FlavorSection({ icecream1, icecream2,icecream3 }) {
  const settings = {
    dots: true,             // show dots
    infinite: true,         // loop forever
    speed: 1000,            // transition speed (1s)
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,         // enable auto scroll
    autoplaySpeed: 2000,    // time between slides (2s)
    cssEase: "linear",      // smooth scrolling
    pauseOnHover: false,    // don’t stop on hover
  };

  return (
   <div
  style={{
    width: "90%",          // scale to 90% of the screen
    maxWidth: "600px",     // max width on large screens
    margin: "0 auto",      // center the slider
  }}
>
  <Slider {...settings}>
    <div>
      <img
        src={icecream1}
        alt="Icecream 1"
        style={{
          width: "100%",          // take full width of container
          height: "auto",         // maintain aspect ratio
          objectFit: "cover",
          borderRadius: "10px",   // optional: rounded corners
        }}
      />
    </div>
    <div>
      <img
        src={icecream2}
        alt="Icecream 2"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
    </div>
        <div>
      <img
        src={icecream3}
        alt="Icecream 2"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />
    </div>
  </Slider>
</div>

  );
}

