import store from '../store'
export const reportCalcs = {
  methods: {
    //returns the fastest runs for each competitor in order from fastest to slowest
    GetOverallFtd() {
      var competitors = store.state.competitors
      var classes = store.state.classList;
      var result = [];
      competitors.forEach(competitor => {
        var compClass = [];
        var runTimes = [];
        var fastestTime;
        var fastestRun;
        if (competitor.Runs) {
          Object.keys(competitor.Runs).forEach(run => {
            // console.log(competitor.Runs[run])
            if (competitor.Runs[run].PenaltyFinal == 0) {
              runTimes.push(competitor.Runs[run].RawFinal);
            }
            else {
              runTimes.push(competitor.Runs[run].PenaltyFinal)
            }
          });
        }

        if (runTimes.length == 1 && typeof runTimes[0] != "number") {
          return console.log("the only run was a dnf");
        }
        if (runTimes.length >= 1) {
          while (runTimes.includes("DNF")) {
            runTimes = runTimes.sort();
            runTimes.pop();
          }
          fastestTime = Math.min(...runTimes);
          Object.keys(competitor.Runs).forEach(run => {

            if (competitor.Runs[run].RawFinal == fastestTime || competitor.Runs[run].PenaltyFinal == fastestTime) {
              fastestRun = Number(run) + 1;
            }
          });
          for (var i = 0; i < classes.length; i++) {
            classes[i].subClasses.forEach(subclass => {
              if (competitor.Class == subclass.class) {
                compClass.push(classes[i].class);
                compClass.push(subclass.class);
              }
            });
          }

          result.push({
            carNumber: competitor.Car,
            driver: competitor.Name,
            carModel: competitor.Model,
            class: compClass,
            run: fastestRun,
            Ftd: fastestTime
          });

        }
      });
      result = result.sort((a, b) => (a.Ftd < b.Ftd) ? -1 : 1)
      // console.log(result)
      return result;
    },
    //returns the fastest times for each vehicle class
    getClassFtd() {
      var result = {
        // "Street": [{carModel:"Honda"}]
      };
      var classList = store.state.classList;
      classList.forEach(c => {
        result[c.class] = [];

      });
      // console.log(result)
      this.GetOverallFtd().forEach(competitor => {
        var mainClasses = Object.keys(result);
        //   console.log(mainClasses)
        for (var i = 0; i < mainClasses.length; i++) {
          if (competitor.class[0] == mainClasses[i]) {
            result[mainClasses[i]].push(competitor);
          }
        }
      });
      // console.log("Result: " + result);
      return result;
    },
    //returns the fastest sector times for each sector
    //NEED TO FIX TO ALLOW FOR ANY NUMBER OF SECTORS
    getSectorFtd() {
      var competitors = store.state.competitors
      var fastest = []
      competitors.forEach(competitor => {
        var sectors = []
        if(competitor.Runs){
          competitor.Runs.forEach(run => {
            var runKeys = Object.keys(run)
            for (var i = 0; i < runKeys.length; i++) {
              if (runKeys[i] != "RawFinal" && runKeys[i] != "PenaltyFinal" && runKeys[i] != "Penalty" && runKeys[i] != "PaxFinal") {
                // console.log(runKeys[i])
                // console.log(run[runKeys[i]])
                if (!sectors[i]) {
                  sectors.push(run[runKeys[i]])
                }
                else {
                  if (sectors[i] > run[runKeys[i]]) {
                    sectors[i] = run[runKeys[i]]
                  }
                }
              }
            }
          })
        }
        else{
          return
        }
        // console.log(sectors.length)
        for (var n = 0; n < sectors.length; n++) {
          if (fastest.length != sectors.length) {
            fastest.push([])
          }
          fastest[n].push({
            carNumber: competitor.Car,
            driver: competitor.Name,
            carModel: competitor.Make,
            class: competitor.Class,
            Ftd: sectors[n]
          })
        }
      });
      console.log(fastest)
      return fastest
    },
    // result.push(sector1Fastest, sector2Fastest, sector3Fastest);

    paxCalcs() {
      var result = []
      var overallData = this.GetOverallFtd()
      var classList = store.state.classList
      overallData.forEach(driver => {
        classList.forEach(c => {
          c.subClasses.forEach(subclass => {
            if (subclass.class == driver.class[1]) {
              driver.paxTime = driver.Ftd * subclass.pax
              driver.paxTime = Number(driver.paxTime.toFixed(3))
            }
          })
        })
        result.push(driver)
      })
      return result
    }
  }
}