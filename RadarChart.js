var RadarChart = {
  draw: function(id, d, options){
  var cfg = {
	 radius: 5, //radius kružića
	 w: 430,
	 h: 430,
	 factor: 0.98,
	 factorLegend: .85,
	 levels: 5,
	 maxValue: 50000,
	 radians: 2 * Math.PI,
	 opacityArea: 0.6,
	 strokeopacity: 1,
	 ToRight: 5,
	 TranslateX: 80,
	 TranslateY: 60,
	 ExtraWidthX: 170,
	 ExtraWidthY: 100,
	 color: "#ffb3b3",
	 colorCircle: "#e60000"
	};
	
	cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
	var allAxis = (d[0].map(function(i, j){return i.axis}));
	var total = allAxis.length;
	var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	var Format = d3.format('.0f');
	var tooltip;
	
	d3.select(id).select('svg').remove();
	var g = d3.select(id)
			.append("svg")
			.attr("width", cfg.w+cfg.ExtraWidthX)
			.attr("height", cfg.h+cfg.ExtraWidthY)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			
	
	//za hexagone
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  var hex = g.selectAll(".levels")
	   .data(allAxis);
	   
	   hex.enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", "white")
	   .style("stroke-opacity", "0.8")
	   .style("stroke-width", "2")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	   
	   hex.exit().remove();
	}	
	
	//za levele
	for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  var level = g.selectAll(".levels")
	   .data([1]);
	   
	   level.enter()
	   .append("svg:text")
	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
	   .attr("class", "legend")
	   .style("font-family", "sans-serif")
	   .style("font-size", "10px")
	   .style("font-weight", "bold")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
	   .attr("fill", "white")
	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
	   
	   level.exit().remove();
	}
	
	var axis = g.selectAll(".axis")
			.data(allAxis);
			
			axis.enter()
			.append("g")
			.attr("class", "axis");
			
	axis.exit().remove();
	
	//za linije
	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-opacity", .5)
		.style("stroke-width", "3px");
	
	//text kod linija
	axis.append("text")
		.attr("class", "legend")
		.text(function(d){return d})
		.style("font-family", "consolas")
		.style("font-size", "20px")
		.attr("text-anchor", "middle")
		.style("fill", "#cccccc")
		.style('font-weight', 'bold')
		.attr("dy", "0.5em")
		.attr("transform", function(d, i){return "translate(0, -10)"})
		.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-70*Math.sin(i*cfg.radians/total);})
		.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-15*Math.cos(i*cfg.radians/total);});
		
 	d.forEach(function(y, x){
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  dataValues.push(dataValues[0]);
	  var area = g.selectAll(".area")
					 .data([dataValues]);
					 
					 area.enter()
					 .append("polygon")
					 .attr("class", "radar-chart-serie")
					 .style("stroke-width", "2px")
					 .style("stroke", cfg.color)
					 .attr("points",function(d) {
						 var str="";
						 for(var pti=0;pti<d.length;pti++){
							 str=str+d[pti][0]+","+d[pti][1]+" ";
						 }
						 return str;
					  })
					 .style("fill", cfg.color)
					 .style("fill-opacity", cfg.opacityArea);
					 
	  area.exit().remove();
	});


	d.forEach(function(y, x){
	  var nodes = g.selectAll(".nodes")
		.data(y);
		
		nodes.enter()
		.append("svg:circle")
		.attr("class", "radar-chart-serie")
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		]);
		return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j){return j.axis})
		.style("fill", cfg.colorCircle).style("fill-opacity", 1)
		.on('mouseover', function (d){
					newX =  parseFloat(d3.select(this).attr('cx')) - 40;
					newY =  parseFloat(d3.select(this).attr('cy')) - 20;
					
					tooltip
						.attr('x', newX)
						.attr('y', newY)
						.text(Format(d.value))
						.style('opacity', 1);					
				  })
		.on('mouseout', function(){
					tooltip						
						.attr('x', 0)
						.attr('y', 0)
						.style('opacity', 0);
					
				  });
				  
	  nodes.exit().remove();

	});
	tooltip = g.append('text')
				.style('font-family', 'consolas')
				.style('font-size', '24px')
				.style('fill', 'white')
				.style('font-weight', 'bold');
  }
};