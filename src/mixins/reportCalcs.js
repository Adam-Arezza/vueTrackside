import store from '../store'
export const reportCalcs = {
    methods: {
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
                        runTimes.push(competitor.Runs[run].RawFinal);
                    });
                }

                if (runTimes.length == 1 && typeof runTimes[0] != "number") {
                    return console.log("the only run was a dnf");
                }
                if (runTimes.length >= 1) {
                    while (runTimes.includes("dnf")) {
                        runTimes = runTimes.sort();
                        runTimes.pop();
                    }
                    fastestTime = Math.min(...runTimes);
                    Object.keys(competitor.Runs).forEach(run => {
                        if (competitor.Runs[run].RawFinal == fastestTime) {

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
            result = result.sort((a,b) => (a.Ftd < b.Ftd) ? -1 : 1)
            console.log(result)
            return result;
        },
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
          getSectorFtd() {
            var competitors = store.state.competitors
            var result = [];
            var sector1Fastest = [];
            var sector2Fastest = [];
            var sector3Fastest = [];
            competitors.forEach(competitor => {
              var sector1 = [];
              var sector2 = [];
              var sector3 = [];
              if (competitor.Runs) {
                Object.keys(competitor.Runs).forEach(run => {
                  var sectors = Object.keys(competitor.Runs[run]);
                  sector1.push(competitor.Runs[run][sectors[0]]).toFixed(3);
                  sector2.push(competitor.Runs[run][sectors[1]]).toFixed(3);
                  sector3.push(competitor.Runs[run][sectors[2]]).toFixed(3);
                });
                var fastestS1 = Math.min(...sector1);
                var fastestS2 = Math.min(...sector2);
                var fastest3 = Math.min(...sector3);
                sector1Fastest.push({
                  driver: competitor.Name,
                  Ftd: fastestS1,
                  carNumber: competitor.Car,
                  class: competitor.Class,
                  carModel: competitor.Make
                });
                sector2Fastest.push({
                  driver: competitor.Name,
                  Ftd: fastestS2,
                  carNumber: competitor.Car,
                  class: competitor.Class,
                  carModel: competitor.Make
                });
                sector3Fastest.push({
                  driver: competitor.Name,
                  Ftd: fastest3,
                  carNumber: competitor.Car,
                  class: competitor.Class,
                  carModel: competitor.Make
                });
              }
            });
            result.push(sector1Fastest, sector2Fastest, sector3Fastest);
            console.log(result)
            return result;
          }
    }
}