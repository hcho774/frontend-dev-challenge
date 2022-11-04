import style from "../styles/Home.module.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
//create a variable initialzed with API addresse
const Logo = require("../assets/logo.svg") as string;
const beaconApi = "https://api.sendbeacon.com/team/schools/";

export default function Home() {
  //create internal state called schools for our component with an initial value of an empty array
  const [schools, setSchools] = useState([]);
  //create useState for search with an initial value of empty string
  const [search, setSearch] = useState("");
  //create useState for latitude information with an initial value of null
  const [lat, setLat] = useState(null);
  //create useState for Longitude information with an initial value of null
  const [lng, setLng] = useState(null);
  //create useState for user location information on with an initial value of false
  const [locationOn, setLocationOn] = useState(false);
  //create useState for status message for location information with an initial value of null

  //getting school information from an API and User Location using useEffect
  useEffect(() => {
    getLocation();
    // firing getLocation(), getSchools() function to get User Location and school information
    getSchools();
  }, [locationOn]);

  //getting school information from an API using fetch GET request
  const getSchools = () =>
    fetch(`${beaconApi}`)
      //getting HTTP response from API and turn it into JSON format
      .then((response) => response.json())
      //getting school infomation in JSON format
      .then((schools) => {
        if (locationOn) {
          //iterate throughschool data by using .map and return a new array of objects with school data and distance information caculated from current User's location added
          const schoolsWithDistance = schools["schools"].map((school) => {
            let distance = getDistance(
              123.444,
              12.3,
              school.coordinates.lat,
              school.coordinates.long
            );
            return { ...school, distance: distance };
          });
          //sort schools by distance and update school useState with the sorted data
          const sortedSchoolsByDistance = schoolsWithDistance.sort(
            (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
          );
          setSchools(sortedSchoolsByDistance);
        } else {
          // sort schools by alphabetically and update school useState with the sorted data when User location is off
          const sortedSchoolsByName = schools["schools"].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setSchools(sortedSchoolsByName);
        }
      });

  // getting User location information using Geolocation API when user clicks input and page loads
  const getLocation = () => {
    //if browser does not support Geolocation then set status message to "not supported" and set LocationOn to false
    if (!navigator.geolocation) {
      setLocationOn(false);
    } else {
      //browser supports Geolocation then get location information and update latitude and longitude state with the information
      const errorCallback = (error) => {
        console.log(`error(${error.code}): ${error.message}`);
      };
      // option function to get Geolocation accurately ane timeout
      const options = {
        enableHighAccuracy: true,
        timeout: 4000,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationOn(true);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        errorCallback,
        options
      );
    }
  };

  //create a function to calculate the distance between two coordinates
  const getDistance = (xA, yA, xB, yB) => {
    let xDiff = xA - xB; //calculate the difference between two coordinates
    let yDiff = yA - yB; //calculate the difference between two coordinates

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff); //return the distance between two coordinates
  };

  //function to handleOnChange when search input value changes
  const handleOnChange = (e) => {
    //update search state with search input value
    setSearch(e.target.value);
  };

  //filter schools where schools' name mataches with the user search input value
  const filteredSchoolLists = schools.filter((school) => {
    return school.name.toLowerCase().includes(search.toLowerCase());
  });

  //renderSchoolLists using .map on filteredSchoolLists
  const renderSchoolList = filteredSchoolLists.map((school) => {
    let initial = school.name.slice(0, 1);

    return (
      <div className={style.school} key={school.id}>
        <div className={style.school_initial}>{initial}</div>
        <div className={style.school_container}>
          <p className={style.school_name}>{school.name}</p>
          <p className={style.school_county}>{school.county}</p>
        </div>
      </div>
    );
  });

  return (
    <div className={style.body}>
      <nav className="navbar navbar-light bg-none" id={style.navbar}>
        <div className="container">
          <span className="navbar-brand" id={style.logo_title}>
            <Image src={Logo} alt="" className={style.logo} />
            BEACON
          </span>
        </div>
      </nav>
      <div className={style.search_title_container}>
        <h1 className={style.search_title}>Pick Your School</h1>
      </div>
      <div className={style.search_sticky}>
        <input
          onClick={getLocation}
          type="text"
          placeholder="Search for your school..."
          onChange={handleOnChange}
          value={search}
          className={style.input}
        />
      </div>
      <div className={style.school_wrapper}>
        <ul className={style.school_list}>{renderSchoolList}</ul>
      </div>
    </div>
  );
}
